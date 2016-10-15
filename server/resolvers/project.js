const { ObjectId } = require('mongodb');
const logger = require('../common/logger');

function serialize(project, props = {}) {
  return Object.assign({}, project, {
    id: project._id,
  },
  props);
}

// TODO: Move to a roles file.
function getRole(db, project, user) {
  if (!user) {
    return { rank: 'NONE', level: 0 };
  } else if (project.owningUser && project.owningUser.equals(user._id)) {
    return { rank: 'OWNER', level: 100 };
  } else {
    return { rank: 'NONE', level: 0 };
  }
}

module.exports = {
  project({ id, name: pname }, { db, user }) {
    const query = {
      deleted: false,
    };
    // if (!user) {
    //   return Promise.reject({ status: 401, error: 'unauthorized' });
    // }
    if (id) {
      query._id = new ObjectId(id);
    }
    if (pname) {
      query.name = pname;
    }
    return db.collection('projects').findOne(query).then(project => {
      if (!project) {
        return null;
      }
      const role = getRole(db, project, user);
      // TODO: Visibility test.
      return serialize(project, { role });
    });
  },

  projects({ name: pname }, { db, user }) {
    const query = {
      // deleted: false,
    };
    if (pname) {
      query.name = pname;
    }
    // if (!user) {
    //   return Promise.reject({ status: 401, error: 'unauthorized' });
    // }
    return db.collection('projects').find(query).sort({ created: -1 }).toArray()
    .then(projects => {
      const results = [];
      // TODO: Visibility test.
      for (const p of projects) {
        const role = getRole(db, p, user);
        results.push(serialize(p, { role }));
      }
      return results;
    });
  },

  newProject({ project }, { db, user }) {
    if (!user) {
      return Promise.reject({ status: 401, error: 'unauthorized' });
    }
    //   const { name, owner } = req.body;
    if (project.name.length < 6) {
      return Promise.reject({ status: 400, error: 'name-too-short' });
    } else if (!project.name.match(/^[a-z0-9\-]+$/)) {
      // Special characters not allowed
      return Promise.reject({ status: 400, error: 'invalid-name' });
    }
    const projects = db.collection('projects');
    return projects.findOne({ name: project.name }).then(p => {
      // Check if project exists
      if (p) {
        return Promise.reject({ status: 400, error: 'name-exists' });
      } else {
        const now = new Date();
        const newProject = {
          name: project.name,
          description: project.description || '',
          title: project.title || '',
          created: now,
          updated: now,
          issueIdCounter: 0,
          deleted: false,
        };
        if (!project.owningUser) {
          newProject.owningUser = user._id;
          newProject.owningOrg = null;
        } else {
          logger.error('Custom owners not supported.');
          return Promise.reject({ status: 400, error: 'unimplemented' });
        }

        return projects.insertOne(newProject).then(result => {
          logger.info('Created project', project.name);
          return projects.findOne({ _id: result.insertedId }).then(np => {
            const role = getRole(db, np, user);
            return serialize(np, { role });
          });
        }, error => {
          logger.error('Error creating project', error);
          return Promise.reject({ status: 500, error: 'internal' });
        });
      }
    }, err => {
      logger.error('Database error checking for project existence', err);
      return Promise.reject({ status: 500, error: 'internal' });
    });
  },

  update({ id, project }, { db, user }) {
    if (!user) {
      return Promise.reject({ status: 401, error: 'unauthorized' });
    }
    const pid = new ObjectId(id);
    const projects = db.collection('projects');
    return projects.findOne({ _id: pid }).then(proj => {
      if (proj) {
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
        return projects.updateOne({ _id: pid }, {
          $set: updates,
        }).then(() => {
          return projects.findOne({ _id: pid }).then(result => {
            return serialize(result);
          });
        }, error => {
          logger.error('Error updating project', id, proj.name, error);
          return Promise.reject(500);
        });
      } else {
        logger.error('Error updating non-existent project', id);
        return Promise.reject(404);
      }
    }, err => {
      logger.error('Error finding project to update', err);
      return Promise.reject(500);
    });
  },

  // TODO: Rename this to 'purge', and make delete merely set the delete flag.
  delete({ id }, { db, user }) {
    if (!user) {
      return Promise.reject({ status: 401, error: 'unauthorized' });
    }
    const pid = new ObjectId(id);
    const projects = db.collection('projects');
    // TODO: Ownership test and role test.
    // Check to see if project exists
    return projects.findOne({ _id: pid }).then(p => {
      if (!p) {
        return Promise.reject({ status: 404, error: 'not-found' });
      }
      return p;
    })
    .then(() => {
      // Delete all isssues and labels
      return Promise.all([
        db.collection('issues').deleteMany({ project: pid }),
        db.collection('labels').deleteMany({ project: pid }),
      ]);
    })
    .then(() => {
      // Delete the actual project
      return projects.deleteOne({ _id: pid });
    })
    .then(() => {
      // Fetch the list of projects
      logger.info('Deleted project:', pid.toString());
      return this.projects({}, { db, user });
    }, error => {
      logger.error('Error deleting project:', pid, error);
      return Promise.reject({ status: 500, error: 'internal' });
    });
  },
};
