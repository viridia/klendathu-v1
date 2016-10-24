const { ObjectId } = require('mongodb');
const logger = require('../common/logger');
const Role = require('../common/role');
const { NotFound, Forbidden, BadRequest, NotImplemented, InternalError, Unauthorized, Errors } =
    require('../common/errors');
const escapeRegExp = require('../lib/escapeRegExp');

function stringPredicate(pred, value) {
  switch (pred) {
    case 'in':
      return { $regex: escapeRegExp(value), $options: 'i' };
    case 'eq':
      return value;
    case '!in':
      return { $not: new RegExp(escapeRegExp(value), 'i') };
    case '!eq':
      return { $ne: value };
    case 'sw':
      return { $regex: `^${escapeRegExp(value)}`, $options: 'i' };
    case 'ew':
      return { $regex: `${escapeRegExp(value)}$`, $options: 'i' };
    default:
      logger.error('Invalid string predicate:', pred);
      return null;
  }
}

const VALID_SORT_KEYS = new Set([
  'id',
  'type',
  'description',
  'created',
  'updated',
  // How to do author and reporter?
]);

const resolverMethods = {
  issue({ project, id }) {
    return this.getProjectAndRole({ projectId: project }).then(([proj, role]) => {
      if (proj === null || (!proj.public && role < Role.VIEWER)) {
        return Promise.reject(new NotFound(Errors.PROJECT_NOT_FOUND));
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

  issues(req) {
    return this.getProjectAndRole({ projectId: req.project }).then(([proj, role]) => {
      if (proj === null || (!proj.public && role < Role.VIEWER)) {
        return Promise.reject(new NotFound(Errors.PROJECT_NOT_FOUND));
      }

      // Build the query expression
      const query = {
        project: new ObjectId(req.project),
      };

      if (req.search) {
        logger.error('unimplemented: issues(search)');
      }

      if (req.type) {
        query.type = { $in: req.type };
      }

      if (req.state) {
        query.state = { $in: req.state };
      }

      if (req.summary) {
        query.summary = stringPredicate(req.summaryPred, req.summary);
        if (!query.summary) {
          return Promise.reject(new BadRequest(Errors.INVALID_PREDICATE));
        }
      }

      if (req.description) {
        query.description = stringPredicate(req.descriptionPred, req.description);
        if (!query.description) {
          return Promise.reject(new BadRequest(Errors.INVALID_PREDICATE));
        }
      }

      if (req.reporter) {
        query.reporter = { $in: req.reporter.map(id => new ObjectId(id)) };
      }

      if (req.owner) {
        query.owner = { $in: req.owner.map(id => new ObjectId(id)) };
      }

      // cc

      // Must match *all* labels
      if (req.labels) {
        query.labels = { $all: req.labels };
      }

      // Other things we might want to search by:
      // keywords
      // custom fields
      // comments / commenter
      // linked
      // created
      // updated

      let sort = ['id', -1];
      if (req.sort) {
        // console.info(req.sort);
        sort = [];
        for (let sortKey of req.sort) {
          let dir = 1;
          if (sortKey.startsWith('-')) {
            sortKey = sortKey.slice(1);
            dir = -1;
          }
          if (!VALID_SORT_KEYS.has(sortKey)) {
            if (sortKey.startsWith('custom.')) {
              return Promise.reject(new NotImplemented());
            }
            return Promise.reject(new BadRequest(Errors.INVALID_SORT_KEY));
          }
          sort.push([sortKey, dir]);
        }
      }

      return this.db.collection('issues').find(query).sort(sort).toArray();
    });
  },

  newIssue({ project, issue }) {
    return this.getProjectAndRole({ projectId: project, mutation: true }).then(([proj, role]) => {
      if (proj === null || (!proj.public && role < Role.VIEWER)) {
        return Promise.reject(new NotFound(Errors.PROJECT_NOT_FOUND));
      } else if (role < Role.REPORTER) {
        return Promise.reject(new Forbidden(Errors.INSUFFICIENT_ACCESS));
      } else if (!issue.type || !issue.state || !issue.summary) {
        return Promise.reject(new BadRequest(Errors.MISSING_FIELD));
      }

      // Increment the issue id counter.
      return this.db.collection('projects').findOneAndUpdate(
          { _id: proj._id },
          { $inc: { issueIdCounter: 1 } })
      .then(p => {
        if (!p) {
          logger.error('Non-existent project', project);
          return Promise.reject(new NotFound(Errors.PROJECT_NOT_FOUND));
        }
        const now = new Date();
        const record = {
          id: p.value.issueIdCounter,
          project: new ObjectId(project),
          type: issue.type,
          state: issue.state,
          summary: issue.summary,
          description: issue.description,
          reporter: this.user.username,
          owner: issue.owner,
          created: now,
          updated: now,
          cc: (issue.cc || []).map(cc => new ObjectId(cc)),
          labels: issue.labels || [],
          linked: (issue.linked || []).map(
              ln => ({ to: new ObjectId(ln.to), relation: ln.relation })),
          custom: issue.custom || [],
        };
        // Insert new user into the database.
        return this.db.collection('issues').insertOne(record).then(result => {
          return result.ops[0];
        }, error => {
          logger.error('Error creating issue', issue, error);
          return Promise.reject(new InternalError());
        });
      });
    });
  },

  updateIssue({ id, project, issue }) {
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

      const issues = this.db.collection('issues');
      return issues.findOne(query).then(existing => {
        if (!existing) {
          logger.error('Error updating non-existent issue', id, this.user);
          return Promise.reject(new NotFound(Errors.ISSUE_NOT_FOUND));
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
          record.cc = issue.cc;
        }

        if (issue.labels) {
          record.labels = issue.labels;
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
          logger.error('Error updating issue', id, proj.name, error);
          return Promise.reject(new InternalError());
        });
      });
    });
  },

  addComment({ id, project, comment }) {
    if (!this.user) {
      return Promise.reject(new Unauthorized());
    }
    return this.getProjectAndRole({ projectId: project }).then(([proj, role]) => {
      if (!proj) {
        logger.error('Error updating non-existent project', id, this.user);
        return Promise.reject(new NotFound(Errors.PROJECT_NOT_FOUND));
      } else if (role < Role.REPORTER) {
        logger.error('Access denied commenting on issue', id, this.user);
        return Promise.reject(new Forbidden(Errors.INSUFFICIENT_ACCESS));
      }

      const query = {
        id,
        project: proj._id,
      };

      const issues = this.db.collection('issues');
      return issues.findOne(query).then(existing => {
        if (!existing) {
          logger.error('Error commenting on non-existent issue', id, this.user);
          return Promise.reject(new NotFound(Errors.ISSUE_NOT_FOUND));
        }

        const now = new Date();
        const update = {
          updated: now,
          comments: existing.comments ? existing.comments.slice() : [],
        };

        update.comments.push({
          author: this.user.username,
          created: now,
          updated: now,
          body: comment,
        });

        return issues.updateOne(query, { $set: update }).then(() => {
          return issues.findOne(query);
        }, error => {
          logger.error('Error updating issue', id, proj.name, error);
          return Promise.reject(new InternalError());
        });
      });
    });
  },
};

module.exports = function (rootClass) {
  Object.assign(rootClass.prototype, resolverMethods);
};
