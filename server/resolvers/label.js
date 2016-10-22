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
    return this.db.collection('labels').find(query).sort({ id: 1 }).toArray();
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
          { $inc: { labelIdCounter: 1 } })
      .then(p => {
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
          creator: this.user._id,
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
    });
  },

  deleteLabel({ project, label }) {
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
      const labelQuery = { project: pid, id: label };
      return labels.findOne(labelQuery).then(l => {
        if (!l) {
          return Promise.reject(new NotFound(Errors.LABEL_NOT_FOUND));
        }
        return issues.updateMany({ project: pid }, { $pullAll: { labels: [l._id] } });
      }).then(() => {
        return labels.deleteOne(labelQuery).then(() => {
          return label;
        });
      }, error => {
        logger.error('Error deleting label:', label, error);
        return Promise.reject(new InternalError());
      });
    });
  },
};

module.exports = function (rootClass) {
  Object.assign(rootClass.prototype, resolverMethods);
};
