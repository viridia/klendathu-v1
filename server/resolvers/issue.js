const { ObjectId } = require('mongodb');
const logger = require('../common/logger');
const Role = require('../common/role');

function serialize(issue, props = {}) {
  return Object.assign({}, issue, props);
}

const resolverMethods = {
  issue({ project, id }) {
    return this.getProjectAndRole({ projectId: project }).then(([proj, role]) => {
      if (proj === null || (!proj.public && role < Role.VIEWER)) {
        return Promise.reject({ status: 404, error: 'missing-project' });
      }
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
    });
  },

  issues({ project, token, label }) {
    return this.getProjectAndRole({ projectId: project }).then(([proj, role]) => {
      if (proj === null || (!proj.public && role < Role.VIEWER)) {
        return Promise.reject({ status: 404, error: 'missing-project' });
      }
      const query = {};
      if (token) {
        logger.error('unimplemented: issues(token)');
      }
      if (label) {
        // TODO: Need an array membership test.
        logger.info('unimplemented: issues(label)');
      }
      // Other things we might want to search for:
      // summary
      // description
      // owner
      // cc
      // reporter
      // keywords
      // custom fields (hardware, etc)
      // comments / commenter
      // states
      // linked
      // created
      // updated
      query.project = new ObjectId(project);
      return this.db.collection('issues').find(query).sort({ id: -1 }).toArray()
          .then(issues => issues.map(serialize));
    });
  },

  newIssue({ project, issue }) {
    return this.getProjectAndRole({ projectId: project, mutation: true }).then(([proj, role]) => {
      if (proj === null || (!proj.public && role < Role.REPORTER)) {
        return Promise.reject({ status: 404, error: 'missing-project' });
      }

      if (!issue.type || !issue.state || !issue.summary) {
        return Promise.reject({ status: 401, error: 'missing-field' });
      }

      // Increment the issue id counter.
      return this.db.collection('projects').findOneAndUpdate(
          { _id: proj._id },
          { $inc: { issueIdCounter: 1 } })
      .then(p => {
        if (!p) {
          logger.error('Non-existent project', project);
          return Promise.reject({ status: 404, error: 'missing-project' });
        }
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
        return this.db.collection('issues').insertOne(record).then(result => {
          return { id: result.ops[0].id };
        }, error => {
          logger.error('Error creating issue', issue, error);
          return Promise.reject({ status: 500, error: 'internal' });
        });
      });
    });
  },
};

module.exports = function (rootClass) {
  Object.assign(rootClass.prototype, resolverMethods);
};
