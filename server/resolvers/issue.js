const { ObjectId } = require('mongodb');
const logger = require('../common/logger');

function serialize(issue, props = {}) {
  return Object.assign({}, issue, props);
}

const resolverMethods = {
  issue({ project, id }) {
    const query = {
      id,
      project: new ObjectId(project),
    };
    return this.db.collection('issues').findOne(query).then(issue => {
      if (!issue) {
        return null;
      }
      return serialize(issue);
    });
  },

  issues({ project, token }) {
    const query = {};
    if (!project) {
      return Promise.reject({ status: 401, error: 'missing-project' });
    }
    if (token) {
      logger.error('unimplemented: issues(token)');
    }
    query.project = new ObjectId(project);
    return this.db.collection('issues').find(query).sort({ id: -1 }).toArray()
        .then(issues => issues.map(serialize));
  },

  newIssue({ project, issue }) {
    if (!this.user) {
      return Promise.reject({ status: 401, error: 'unauthorized' });
    }
    if (!issue.type || !issue.state || !issue.summary) {
      return Promise.reject({ status: 401, error: 'missing-field' });
    }
    const projects = this.db.collection('projects');
    const issues = this.db.collection('issues');
    return projects.findOneAndUpdate(
        { _id: new ObjectId(project) },
        { $inc: { issueIdCounter: 1 } })
    .then(p => {
      if (!p) {
        logger.error('Non-existent project', project);
        return Promise.reject(404);
      }
      // TODO: Ownership test.
      const now = new Date();
      const record = {
        id: p.value.issueIdCounter,
        project: new ObjectId(project),
        type: issue.type,
        state: issue.state,
        summary: issue.summary,
        description: issue.description,
        reporter: this.user._id,
        owner: issue.owner,
        created: now,
        updated: now,
        cc: (issue.cc || []).map(cc => new ObjectId(cc)),
        labels: (issue.labels || []).map(lb => new ObjectId(lb)),
        linked: (issue.linked || []).map(
            ln => ({ to: new ObjectId(ln.to), relation: ln.relation })),
        custom: issue.custom || [],
      };
      // Insert new user into the database.
      return issues.insertOne(record).then(result => {
        return { id: result.ops[0].id };
      }, error => {
        logger.error('Error creating issue', issue, error);
        return Promise.reject({ status: 500, error: 'internal' });
      });
    });
  },
};

module.exports = function (rootClass) {
  Object.assign(rootClass.prototype, resolverMethods);
};
