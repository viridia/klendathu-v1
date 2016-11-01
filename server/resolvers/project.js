const { ObjectId } = require('mongodb');
const logger = require('../common/logger');
const Role = require('../common/role');
const { BadRequest, NotFound, InternalError, Unauthorized, Forbidden, Unimplemented, Errors } =
    require('../common/errors');

function serialize(project, props = {}) {
  return Object.assign({}, project, {
    id: project._id,
  },
  props);
}

// TODO: Move to a roles file.
function getRole(db, project, user) {
  if (!user) {
    return Role.NONE;
  } else if (project.owningUser && project.owningUser === user.username) {
    return Role.OWNER;
  } else {
    return Role.NONE;
  }
}

const resolverMethods = {
  /** Look up a single project and return a promise that resolves to both the project and the
      current user's role.
  */
  getProjectAndRole({ projectId, projectName, mutation = false }) {
    const query = {
      deleted: false,
    };
    if (projectId) {
      query._id = new ObjectId(projectId);
    } else if (projectName) {
      query.name = projectName;
    } else {
      return Promise.reject(new BadRequest('no-project-id'));
    }
    // If this is a mutation and the user is not logged in, then don't even bother doing a
    // database lookup for the project, since they won't be able to do anything.
    if (mutation && !this.user) {
      return Promise.resolve([null, Role.NONE]);
    }
    return this.db.collection('projects').findOne(query).then(project => {
      if (!project) {
        return [null, Role.NONE];
      }
      if (this.user && this.user.username === project.owningUser) {
        return [project, Role.OWNER];
      }
      // TODO: Lookup user role.
      // TODO: Return null for project if it's private and user is not a member.
      return [project, Role.NONE];
    });
  },

  project({ id, name }) {
    return this.getProjectAndRole({ projectId: id, projectName: name }).then(([project, role]) => {
      if (!project || (role === Role.NONE && !project.public)) {
        return null;
      }
      return serialize(project, {
        role,
        template: this.template({ project: 'std', name: 'software' }),
        workflow: this.workflow({ project: 'std', name: 'bugtrack' }),
      });
    });
  },

  projects({ name: pname }) {
    if (!this.user || !this.user.username) {
      return [];
    }

    // Get this user's list of project memberships.
    return this.db.collection('projectMemberships').find({ user: this.user.username }).toArray()
    .then(memberships => {
      // Query all projects for which this user is an owner or a member.
      const projectIdList = memberships.map(m => m._id);
      const query = {
        deleted: false,
        $or: [
          { owningUser: this.user.username },
          { _id: { $in: projectIdList } },
        ],
      };
      if (pname) {
        query.name = pname;
      }
      return this.db.collection('projects').find(query).sort({ created: -1 }).toArray()
      .then(projects => {
        const results = [];
        for (const p of projects) {
          // TODO: Need a specialized version of lookup role
          const role = getRole(this.db, p, this.user);
          results.push(serialize(p, { role }));
        }
        return results;
      });
    });
  },

  newProject({ project }) {
    if (!this.user) {
      return Promise.reject(new Unauthorized());
    }
    //   const { name, owner } = req.body;
    if (project.name.length < 6) {
      return Promise.reject(new BadRequest(Errors.NAME_TOO_SHORT));
    } else if (!project.name.match(/^[a-z0-9\-]+$/)) {
      // Special characters not allowed
      return Promise.reject(new BadRequest(Errors.INVALID_NAME));
    }
    const projects = this.db.collection('projects');
    return projects.findOne({ name: project.name }).then(p => {
      // Check if project exists
      if (p) {
        return Promise.reject(new BadRequest(Errors.NAME_EXISTS));
      } else {
        const now = new Date();
        const newProject = {
          name: project.name,
          description: project.description || '',
          title: project.title || '',
          created: now,
          updated: now,
          issueIdCounter: 0,
          labelIdCounter: 0,
          deleted: false,
        };
        if (!project.owningUser) {
          newProject.owningUser = this.user.username;
          newProject.owningOrg = null;
        } else {
          // TODO: Make the user an administrator
          // TODO: Make sure the org exists.
          logger.error('Custom owners not supported.');
          return Promise.reject(new Unimplemented());
        }

        return projects.insertOne(newProject).then(result => {
          logger.info('Created project', project.name);
          return projects.findOne({ _id: result.insertedId }).then(np => {
            // TODO: Since we just created the project, we should not need to look up the role.
            const role = getRole(this.db, np, this.user);
            return serialize(np, {
              role,
              template: this.template({ project: 'std', name: 'software' }),
              workflow: this.workflow({ project: 'std', name: 'bugtrack' }),
            });
          });
        }, error => {
          logger.error('Error creating project', error);
          return Promise.reject(new InternalError());
        });
      }
    }, err => {
      logger.error('Database error checking for project existence', err);
      return Promise.reject(new InternalError());
    });
  },

  updateProject({ id, project }) {
    if (!this.user) {
      return Promise.reject(new Unauthorized());
    }
    const projects = this.db.collection('projects');
    return this.getProjectAndRole({ projectId: id }).then(([proj, role]) => {
      if (!proj) {
        logger.error('Error updating non-existent project', id, this.user);
        return Promise.reject(new NotFound(Errors.PROJECT_NOT_FOUND));
      } else if (role < Role.ADMINISTRATOR) {
        logger.error('Access denied updating project', id, this.user);
        return Promise.reject(new Forbidden(Errors.INSUFFICIENT_ACCESS));
      }

      // TODO: Ownership test and role test.
      const updates = {
        updated: new Date(),
      };
      if (project.title) {
        updates.title = project.title;
      }
      if (project.description) {
        updates.description = project.description;
      }
      // TODO: owning user, owning org, template name, workflow name
      // All of which need validation
      return projects.updateOne({ _id: proj._id }, {
        $set: updates,
      }).then(() => {
        return projects.findOne({ _id: proj._id }).then(result => {
          return serialize(result);
        });
      }, error => {
        logger.error('Error updating project', id, proj.name, error);
        return Promise.reject(new InternalError());
      });
    }, err => {
      logger.error('Error finding project to update', err);
      return Promise.reject(new InternalError());
    });
  },

  // TODO: Rename this to 'purge', and make delete merely set the delete flag.
  deleteProject({ id }, { user }) {
    if (!user) {
      return Promise.reject(new Unauthorized());
    }
    const pid = new ObjectId(id);
    const projects = this.db.collection('projects');
    // Check to see if project exists
    return this.getProjectAndRole({ projectId: id }).then(([proj, role]) => {
      // Make sure we have permissions to do this.
      if (!proj) {
        logger.error('Error updating non-existent project', id, this.user);
        return Promise.reject(new NotFound(Errors.PROJECT_NOT_FOUND));
      } else if (role < Role.ADMINISTRATOR) {
        logger.error('Access denied updating project', id, this.user);
        return Promise.reject(new Forbidden(Errors.INSUFFICIENT_ACCESS));
      }
      return proj;
    })
    .then(() => {
      // Delete all isssues and labels associated with this project
      return Promise.all([
        this.db.collection('issues').deleteMany({ project: pid }),
        this.db.collection('labels').deleteMany({ project: pid }),
      ]);
    })
    .then(() => {
      // Delete the actual project
      return projects.deleteOne({ _id: pid });
    })
    .then(() => {
      // Fetch the list of projects
      // TODO: Avoid this with smart client updating?
      // TODO: Only return projects which are visible to this user.
      logger.info('Deleted project:', pid.toString());
      return pid;
    }, error => {
      logger.error('Error deleting project:', pid, error);
      return Promise.reject(new InternalError());
    });
  },
};

module.exports = function (rootClass) {
  Object.assign(rootClass.prototype, resolverMethods);
};
