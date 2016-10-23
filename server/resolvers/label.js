const { ObjectId } = require('mongodb');
const logger = require('../common/logger');
const escapeRegExp = require('../lib/escapeRegExp');
const Role = require('../common/role');
const { NotFound, Forbidden, BadRequest, Unauthorized, InternalError, Errors } =
    require('../common/errors');

const resolverMethods = {
  label({ project, id }) {
    return this.db.collection('labels').findOne({ id, project: new ObjectId(project) });
  },

  labels({ token, project }) {
    const query = {};
    if (token) {
      const pattern = `\\b${escapeRegExp(token)}`;
      query.name = { $regex: pattern, $options: 'i' };
    }
    if (project) {
      query.project = new ObjectId(project);
    }
    return this.db.collection('labels').find(query).sort({ name: 1 }).toArray();
  },

  labelsById({ project, idList }) {
    const query = {
      id: { $in: idList },
      project,
    };
    return this.db.collection('labels').find(query).sort({ name: 1 }).toArray();
  },

  newLabel({ project, label }) {
    if (!this.user) {
      return Promise.reject(new Unauthorized());
    }
    return this.getProjectAndRole({ projectId: project, mutation: true }).then(([proj, role]) => {
      if (proj === null || (!proj.public && role < Role.VIEWER)) {
        return Promise.reject(new NotFound(Errors.PROJECT_NOT_FOUND));
      } else if (role < Role.DEVELOPER) {
        return Promise.reject(new Forbidden(Errors.INSUFFICIENT_ACCESS));
      } else if (!label.name || !label.color) {
        return Promise.reject(new BadRequest(Errors.MISSING_FIELD));
      }

      // Increment the issue id counter.
      return this.db.collection('projects').findOneAndUpdate(
          { _id: proj._id },
          { $inc: { labelIdCounter: 1 } });
    }).then(p => {
      if (!p) {
        return Promise.reject(new NotFound(Errors.PROJECT_NOT_FOUND));
      }

      const labels = this.db.collection('labels');
      const now = new Date();
      const record = {
        project: new ObjectId(project),
        id: p.value.labelIdCounter,
        name: label.name,
        color: label.color,
        creator: this.user.username,
        created: now,
        updated: now,
      };
      // Insert new user into the database.
      return labels.insertOne(record).then(result => {
        return result.ops[0];
      }, error => {
        logger.error('Error creating label', label, error);
        return Promise.reject(new InternalError());
      });
    });
  },

  updateLabel({ id, project, label }) {
    if (!this.user) {
      return Promise.reject(new Unauthorized());
    }
    return this.getProjectAndRole({ projectId: project }).then(([proj, role]) => {
      if (!proj) {
        logger.error('Error updating non-existent project', id, this.user);
        return Promise.reject(new NotFound(Errors.PROJECT_NOT_FOUND));
      } else if (role < Role.UPDATER) {
        logger.error('Access denied updating issue', id, this.user);
        return Promise.reject(new Forbidden(Errors.INSUFFICIENT_ACCESS));
      }

      const query = {
        id,
        project: proj._id,
      };

      const labels = this.db.collection('labels');
      return labels.findOne(query).then(existing => {
        if (!existing) {
          logger.error('Error updating non-existent label', id, this.user);
          return Promise.reject(new NotFound(Errors.LABEL_NOT_FOUND));
        }

        const record = {
          updated: new Date(),
        };

        if (label.name) {
          record.name = label.name;
        }

        if (label.color) {
          record.color = label.color;
        }

        return labels.updateOne(query, {
          $set: record,
        }).then(() => {
          return labels.findOne(query);
        }, error => {
          logger.error('Error updating label', id, proj.name, error);
          return Promise.reject(new InternalError());
        });
      });
    });
  },

  deleteLabel({ project, id }) {
    if (!this.user) {
      return Promise.reject(new Unauthorized());
    }
    return this.getProjectAndRole({ projectId: project, mutation: true }).then(([proj, role]) => {
      if (proj === null || (!proj.public && role < Role.VIEWER)) {
        return Promise.reject(new NotFound(Errors.PROJECT_NOT_FOUND));
      } else if (role < Role.DEVELOPER) {
        return Promise.reject(new Forbidden(Errors.INSUFFICIENT_ACCESS));
      }

      const pid = new ObjectId(project);
      const issues = this.db.collection('issues');
      const labels = this.db.collection('labels');
      const labelQuery = { project: pid, id };
      return labels.findOne(labelQuery).then(l => {
        if (!l) {
          return Promise.reject(new NotFound(Errors.LABEL_NOT_FOUND));
        }
        return issues.updateMany({ project: pid }, { $pullAll: { labels: [l.id] } });
      }).then(() => {
        return labels.deleteOne(labelQuery).then(() => {
          return id;
        });
      }, error => {
        logger.error('Error deleting label:', id, project, error);
        return Promise.reject(new InternalError());
      });
    });
  },
};

module.exports = function (rootClass) {
  Object.assign(rootClass.prototype, resolverMethods);
};
