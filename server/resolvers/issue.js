const { ObjectId } = require('mongodb');
const logger = require('../common/logger');
const Role = require('../common/role');

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
        return issue;
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
      return this.db.collection('issues').find(query).sort({ id: -1 }).toArray();
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

  updateIssue({ id, project, issue }) {
    if (!this.user) {
      return Promise.reject({ status: 401, error: 'unauthorized' });
    }
    return this.getProjectAndRole({ projectId: project }).then(([proj, role]) => {
      if (!proj) {
        logger.error('Error updating non-existent project', id, this.user);
        return Promise.reject({ status: 404, error: 'project-not-found' });
      } else if (role < Role.UPDATER) {
        logger.error('Access denied updating issue', id, this.user);
        return Promise.reject({ status: 401, error: 'update-not-permitted' });
      }

      const query = {
        id,
        project: proj._id,
      };

      const issues = this.db.collection('issues');
      return issues.findOne(query).then(existing => {
        if (!existing) {
          logger.error('Error updating non-existent issue', id, this.user);
          return Promise.reject({ status: 404, error: 'issue-not-found' });
        }

        const record = {
          updated: new Date(),
        };

        if (issue.type) {
          record.type = issue.type;
        }

        if (issue.state) {
          record.state = issue.state;
        }

        if (issue.summary) {
          record.summary = issue.summary;
        }

        if (issue.description) {
          record.description = issue.description;
        }

        if (issue.owner) {
          record.owner = issue.owner;
        }

        if (issue.cc) {
          record.cc = issue.cc.map(cc => new ObjectId(cc));
        }

        if (issue.labels) {
          record.labels = issue.labels.map(lb => new ObjectId(lb));
        }

        if (issue.linked) {
          record.linked = issue.linked.map(
              ln => ({ to: new ObjectId(ln.to), relation: ln.relation }));
        }

        if (issue.custom !== undefined) {
          record.custom = issue.custom;
        }

        // TODO: owning user, owning org, template name, workflow name
        // All of which need validation
        return issues.updateOne(query, {
          $set: record,
        }).then(() => {
          return issues.findOne(query);
        }, error => {
          logger.error('Error updating project', id, proj.name, error);
          return Promise.reject({ status: 500, error: 'internal' });
        });
      });
    });
  },
};

module.exports = function (rootClass) {
  Object.assign(rootClass.prototype, resolverMethods);
};
