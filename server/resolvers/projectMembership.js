const { ObjectId } = require('mongodb');
const logger = require('../common/logger');
const Role = require('../common/role');
const { NotFound, Forbidden, Unauthorized, InternalError, Errors } = require('../common/errors');

const resolverMethods = {
  projectMembership({ project, user }) {
    return this.db.collection('projectMemberships').findOne(
        { user: user || (this.user && this.user.username), project: new ObjectId(project) });
  },

  projectMemberships({ project }) {
    const query = {};
    if (project) {
      query.project = new ObjectId(project);
    }
    return this.db.collection('projectMemberships').find(query).sort({ user: 1 }).toArray()
    .then(members => {
      return members;
    });
  },

  updateProjectMembership({ project, user, membership }) {
    if (!this.user) {
      return Promise.reject(new Unauthorized());
    }
    return this.getProjectAndRole({ projectId: project }).then(([proj, role]) => {
      if (!proj) {
        logger.error('Error updating non-existent project', project, this.user);
        return Promise.reject(new NotFound(Errors.PROJECT_NOT_FOUND));
      } else if (role < Role.VIEWER || (role < Role.MANAGER && user !== this.user.username)) {
        // Current user must be a member of the project to update their own membership.
        // Must be a manager to update someone else's membership.
        // TODO: Perhaps break out setting of roles to a separate method?
        logger.error('Access denied updating project membership', project, this.user);
        return Promise.reject(new Forbidden(Errors.INSUFFICIENT_ACCESS));
      }

      const query = {
        user,
        project: proj._id,
      };

      const pms = this.db.collection('projectMemberships');
      return pms.findOne(query).then(existing => {
        const update = { $set: { updated: new Date() } };

        // Create if non-existent
        if (!existing) {
          update.$set.user = user;
          update.$set.project = proj._id;
          update.$set.role = null;
        }

        // Role change
        if (membership.role) {
          if (role < Role.ADMINISTRATOR) {
            logger.error('Access denied changing user role', project, this.user);
            return Promise.reject(new Forbidden(Errors.INSUFFICIENT_ACCESS));
          }
          update.$set.role = membership.role;
        }

        // List of displayed labels (hot list)
        if (membership.labels) {
          update.$set.labels = membership.labels;
        }

        if (membership.addLabels) {
          update.$addToSet = { labels: { $each: membership.addLabels } };
        }

        if (membership.removeLabels) {
          update.$pullAll = { labels: membership.removeLabels };
        }

        // Filters
        if (membership.filters) {
          update.$set.filters = {};
          membership.filters.forEach(filter => {
            update.$set.filters[filter.name] = filter.value;
          });
        }

        if (membership.addFilters) {
          if (!existing || !existing.filters) {
            update.$set.filters = {};
            membership.addFilters.forEach(filter => {
              update.$set.filters[filter.name] = filter.value;
            });
          } else {
            membership.addFilters.forEach(filter => {
              update.$set[`filters.${filter.name}`] = filter.value;
            });
          }
        }

        if (membership.removeFilters) {
          update.$unset = {};
          membership.removeFilters.forEach(name => {
            update.$unset[`filters.${name}`] = '';
          });
        }

        return pms.updateOne(query, update, { upsert: true }).then(() => {
          return pms.findOne(query);
        }, error => {
          logger.error('Error updating project membership', user, proj.name, error);
          return Promise.reject(new InternalError());
        });
      });
    });
  },
};

module.exports = function (rootClass) {
  Object.assign(rootClass.prototype, resolverMethods);
};
