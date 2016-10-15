const { ObjectId } = require('mongodb');
const logger = require('../common/logger');

function serialize(issue) {
  return Object.assign({}, issue);
}

module.exports = {
  isssue({ id }, { db }) {
    const query = {};
    if (id) {
      query._id = new ObjectId(id);
    }
    return db.collection('issues').findOne(query).then(issue => {
      if (!issue) {
        return null;
      }
      return serialize(issue);
    });
  },

  issues({ project, token }, { db }) {
    const query = {};
    if (!project) {
      return Promise.reject(400);
    }
    query.project = new ObjectId(project);
    return db.collection('issues').find(query).sort({ id: -1 }).toArray()
        .then(issues => issues.map(serialize));
  },

  newIssue({ project, issue }, { db, user }) {
    if (!user) {
      return Promise.reject(401);
    }
    if (!issue.type || !issue.state || !issue.summary) {
      // TODO: Need a better error code format.
      return Promise.reject(400);
    }
    const projects = db.collection('projects');
    const issues = db.collection('issues');
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
        owner: user._id,
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
        return Promise.reject(500);
      });
    });
  },
};
