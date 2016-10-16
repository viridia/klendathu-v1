const { ObjectId } = require('mongodb');
const logger = require('../common/logger');
const escapeRegExp = require('../lib/escapeRegExp');

function serialize(issue) {
  return Object.assign({ id: issue._id }, issue);
}

const resolverMethods = {
  label({ id }) {
    return this.db.collection('labels').findOne({ _id: new ObjectId(id) }).then(l => {
      if (!l) {
        return null;
      }
      return serialize(l);
    });
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
    return this.db.collection('labels').find(query).sort({ name: 1 }).toArray()
        .then(l => l.map(serialize));
  },

  newLabel({ project, label }) {
    if (!this.user) {
      return Promise.reject(401);
    }
    if (!label.name || !label.color) {
      return Promise.reject({ status: 401, error: 'unauthorized' });
    }
    const projects = this.db.collection('projects');
    const labels = this.db.collection('labels');
    return projects.findOne({ _id: new ObjectId(project) }).then(p => {
      if (!p) {
        logger.error('Non-existent project', project);
        return Promise.reject({ status: 404, error: 'project-not-found' });
      }
      // TODO: Project role test.
      const now = new Date();
      const record = {
        project: new ObjectId(project),
        name: label.name,
        color: label.color,
        creator: this.user._id,
        created: now,
        updated: now,
      };
      // Insert new user into the database.
      return labels.insertOne(record).then(result => {
        return serialize(result.ops[0]);
      }, error => {
        logger.error('Error creating issue', label, error);
        return Promise.reject({ status: 500, error: 'internal' });
      });
    });
  },
};

module.exports = function (rootClass) {
  Object.assign(rootClass.prototype, resolverMethods);
};
