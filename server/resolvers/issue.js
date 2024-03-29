const { ObjectId } = require('mongodb');
const logger = require('../common/logger');
const Role = require('../common/role');
const { NotFound, Forbidden, BadRequest, InternalError, Unauthorized, Errors } =
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

function inverseRelation(relation) {
  switch (relation) {
    case 'blocked-by': return 'blocks';
    case 'blocks': return 'blocked-by';
    case 'included-by': return 'includes';
    case 'includes': return 'included-by';
    default:
      return relation;
  }
}

function symbolicUserName(user, username) {
  if (username === 'me') {
    return user ? user.username : null;
  } else if (username === 'none') {
    return null;
  } else {
    return username;
  }
}

function customArrayToMap(custom) {
  const result = {};
  custom.forEach(({ name, value }) => { result[name] = value; });
  return result;
}

function mapFromObject(obj) {
  const map = new Map();
  Object.keys(obj).forEach(key => {
    map.set(key, obj[key]);
  });
  return map;
}

const VALID_SORT_KEYS = new Set([
  'id',
  'type',
  'state',
  'summary',
  'description',
  'created',
  'updated',
  'owner',
  'reporter',
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

      if (role < Role.VIEWER) {
        // If they are not a project member, only allow public issues to be viewed.
        query.public = true;
      }

      return this.db.collection('issues').findOne(query);
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

      if (role < Role.VIEWER) {
        // If they are not a project member, only allow public issues to be viewed.
        query.public = true;
      }

      if (req.search) {
        query.$text = { $search: req.search };
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
        query.reporter = { $in: req.reporter.map(o => symbolicUserName(this.user, o)) };
      }

      if (req.owner) {
        query.owner = { $in: req.owner.map(o => symbolicUserName(this.user, o)) };
      }

      // Must match *all* labels
      if (req.labels) {
        query.labels = { $all: req.labels };
      }

      // Other things we might want to search by:
      // cc
      // comments / commenter
      // linked
      // created
      // updated

      if (req.custom) {
        for (const term of req.custom) {
          const { name, value, values } = term;
          if (value) {
            query[`custom.${name}`] = { $regex: escapeRegExp(value), $options: 'i' };
          } else if (values) {
            query[`custom.${name}`] = { $in: values };
          }
        }
      }

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
            if (!sortKey.startsWith('custom.')) {
              return Promise.reject(new BadRequest(Errors.INVALID_SORT_KEY));
            }
          }
          sort.push([sortKey, dir]);
        }
      }

      const issues = this.db.collection('issues');
      if (req.subtasks) {
        return this.findSubtasks(query, sort);
      }
      return issues.find(query).sort(sort).toArray();
    });
  },

  issueSearch({ project, search }) {
    return this.getProjectAndRole({ projectId: project }).then(([proj, role]) => {
      if (proj === null || (!proj.public && role < Role.VIEWER)) {
        return Promise.reject(new NotFound(Errors.PROJECT_NOT_FOUND));
      }

      const query = {
        project: new ObjectId(project),
        $text: { $search: search },
      };

      if (role < Role.VIEWER) {
        // If they are not a project member, only allow public issues to be viewed.
        query.public = true;
      }

      const sort = { score: { $meta: 'textScore' } };
      return this.db.collection('issues')
        .find(query, { score: { $meta: 'textScore' } }).sort(sort).toArray();
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
        let commentIndex = 0;
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
          cc: (issue.cc || []),
          labels: issue.labels || [],
          linked: issue.linked || [],
          custom: issue.custom ? customArrayToMap(issue.custom) : {},
          attachments: issue.attachments || [],
          public: !!issue.public,
          comments: (issue.comments || []).map(comment => ({
            id: () => { commentIndex += 1; return commentIndex; },
            body: comment.body,
            author: this.user.username,
            created: now,
            updated: now,
          })),
        };

        return this.findLinked(record.project, record.linked).then(issueRefs => {
          return this.db.collection('issues').insertOne(record).then(result => {
            if (issue.linked) {
              return this.reconcileLinks(result.ops[0], issueRefs);
            }
            return result.ops[0];
          }, error => {
            logger.error('Error creating issue', issue, error);
            return Promise.reject(new InternalError());
          });
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

        const update = {
          $set: record,
        };

        function append(field, value) {
          if (update.$push) {
            update.$push[field] = value;
          } else {
            update.$push = { [field]: value };
          }
        }

        const change = {
          by: this.user.username,
        };

        if (issue.type !== undefined && issue.type !== existing.type) {
          record.type = issue.type;
          change.type = { before: existing.type, after: issue.type };
          change.at = record.updated;
        }

        if (issue.state !== undefined && issue.state !== existing.state) {
          record.state = issue.state;
          change.state = { before: existing.state, after: issue.state };
          change.at = record.updated;
        }

        if (issue.summary !== undefined && issue.summary !== existing.summary) {
          record.summary = issue.summary;
          change.summary = { before: existing.summary, after: issue.summary };
          change.at = record.updated;
        }

        if (issue.description !== undefined && issue.description !== existing.description) {
          record.description = issue.description;
          change.description = { before: existing.description, after: issue.description };
          change.at = record.updated;
        }

        if (issue.owner !== undefined && issue.owner !== existing.owner) {
          record.owner = issue.owner;
          change.owner = { before: existing.owner, after: issue.owner };
          change.at = record.updated;
        }

        if (issue.cc) {
          record.cc = issue.cc;
          const ccPrev = new Set(existing.cc);
          const ccNext = new Set(issue.cc);
          issue.cc.forEach(cc => ccPrev.delete(cc));
          existing.cc.forEach(cc => ccNext.delete(cc));
          if (ccNext.size > 0 || ccPrev.size > 0) {
            change.cc = { added: Array.from(ccNext), removed: Array.from(ccPrev) };
            change.at = record.updated;
          }
        }

        if (issue.labels) {
          record.labels = issue.labels;
          const labelsPrev = new Set(existing.labels);
          const labelsNext = new Set(issue.labels);
          issue.labels.forEach(labels => labelsPrev.delete(labels));
          existing.labels.forEach(labels => labelsNext.delete(labels));
          if (labelsNext.size > 0 || labelsPrev.size > 0) {
            change.labels = { added: Array.from(labelsNext), removed: Array.from(labelsPrev) };
            change.at = record.updated;
          }
        }

        if (issue.linked) {
          record.linked = issue.linked.map(ln => ({ to: ln.to, relation: ln.relation }));
          const linkedPrev = new Map(existing.linked.map(ln => [ln.to, ln.relation]));
          const linkedNext = new Map(issue.linked.map(ln => [ln.to, ln.relation]));
          const linkedChange = [];
          linkedNext.forEach((relation, to) => {
            if (linkedPrev.has(to)) {
              const before = linkedPrev.get(to);
              if (relation !== before) {
                // A changed value
                linkedChange.push({ to, before, after: relation });
              }
            } else {
              // A newly-added value
              linkedChange.push({ to, after: relation });
            }
          });
          linkedPrev.forEach((relation, to) => {
            if (!linkedNext.has(to)) {
              // A deleted value
              linkedChange.push({ to, before: relation });
            }
          });
          if (linkedChange.length > 0) {
            change.linked = linkedChange;
            change.at = record.updated;
          }
        }

        if (issue.custom !== undefined) {
          record.custom = customArrayToMap(issue.custom);
          const customPrev = mapFromObject(existing.custom);
          const customNext = mapFromObject(record.custom);
          const customChange = [];
          customNext.forEach((value, name) => {
            if (customPrev.has(name)) {
              const before = customPrev.get(name);
              if (value !== before) {
                // A changed value
                customChange.push({ name, before, after: value });
              }
            } else {
              // A newly-added value
              customChange.push({ name, after: value });
            }
          });
          customPrev.forEach((value, name) => {
            if (!customNext.has(name)) {
              // A deleted value
              customChange.push({ name, before: value });
            }
          });
          if (customChange.length > 0) {
            change.custom = customChange;
            change.at = record.updated;
          }
        }

        if (issue.attachments) {
          const existingAttachments = existing.attachments || [];
          record.attachments = issue.attachments;
          const attachmentsPrev = new Set(existingAttachments);
          const attachmentsNext = new Set(issue.attachments);
          issue.attachments.forEach(attachments => attachmentsPrev.delete(attachments));
          existingAttachments.forEach(attachments => attachmentsNext.delete(attachments));
          if (attachmentsNext.size > 0 || attachmentsPrev.size > 0) {
            change.attachments = {
              added: Array.from(attachmentsNext),
              removed: Array.from(attachmentsPrev),
            };
            change.at = record.updated;
          }
        }

        // Patch comments list.
        // Note that we don't include comments in the change log since the comments themselves can
        // serve that purpose.
        if (issue.comments !== undefined) {
          const commentMap = new Map();
          const commentList = [];
          let nextCommentIndex = 0;
          // Build a map of existing comments.
          if (existing.comments) {
            for (const c of existing.comments) {
              commentMap.set(c.id, c);
              commentList.push(c);
              nextCommentIndex = Math.max(nextCommentIndex, c.id);
            }
          }
          for (const c of issue.comments) {
            if (c.id) {
              const oldComment = commentMap.get(c.id);
              // You can only modify your own comments.
              if (oldComment !== null && oldComment.author === this.user.username) {
                oldComment.body = c.body;
                oldComment.updated = record.updated;
              }
            } else {
              // Insert a new comment from this author.
              nextCommentIndex += 1;
              commentList.push({
                id: nextCommentIndex,
                author: this.user.username,
                body: c.body,
                created: record.updated,
                updated: record.updated,
              });
            }
          }

          record.comments = commentList;
        }

        // Append the change log entry to the list of changes.
        if (change.at) {
          append('changes', change);
        }

        // TODO: owning user, owning org, template name, workflow name
        // All of which need validation
        return this.findLinked(query.project, record.linked, existing.linked).then(issueRefs => {
          return issues.updateOne(query, update).then(() => {
            const result = issues.findOne(query);
            if (issue.linked) {
              return result.then(ni => this.reconcileLinks(ni, issueRefs));
            }
            return result;
          }, error => {
            logger.error('Error updating issue', id, proj.name, error);
            return Promise.reject(new InternalError());
          });
        });
      });
    });
  },

  deleteIssue({ id, project }) {
    if (!this.user) {
      return Promise.reject(new Unauthorized());
    }
    return this.getProjectAndRole({ projectId: project }).then(([proj, role]) => {
      if (!proj) {
        logger.error('Error updating non-existent project', id, this.user);
        return Promise.reject(new NotFound(Errors.PROJECT_NOT_FOUND));
      } else if (role < Role.MANAGER) {
        logger.error('Access denied deleting issue', id, this.user);
        return Promise.reject(new Forbidden(Errors.INSUFFICIENT_ACCESS));
      }

      const query = { id, project: proj._id };
      const issues = this.db.collection('issues');
      return issues.findOne(query).then(existing => {
        if (!existing) {
          logger.error('Error deleting non-existent issue', id, this.user);
          return Promise.reject(new NotFound(Errors.ISSUE_NOT_FOUND));
        }

        return this.findLinked(query.project, [], existing.linked).then(issueRefs => {
          return issues.deleteOne(query).then(() => {
            if (existing.linked) {
              existing.linked = [];
              return this.reconcileLinks(existing, issueRefs).then(() => id);
            }
            return id;
          }, error => {
            logger.error('Error deleting issue', id, proj.name, error);
            return Promise.reject(new InternalError());
          });
        });
      });
    });
  },

  /** Retrieve all of the issues that are in the linked issue list. */
  findLinked(project, linked = [], existing = []) {
    const combined = linked.concat(existing);
    if (combined === undefined) {
      return Promise.resolve([]);
    }
    const toIds = Array.from(new Set(combined.map(ln => ln.to)));
    if (toIds.length === 0) {
      return Promise.resolve([]);
    }
    const issues = this.db.collection('issues');
    return issues.find({ project, id: { $in: toIds } }).toArray().then(found => {
      if (found.length < toIds.length) {
        return Promise.reject(new BadRequest(Errors.INVALID_LINK));
      }
      return new Map(found.map(issue => [issue.id, issue]));
    });
  },

  /* Given an initial query, finds all issues reachable via a subtask or supertask link. */
  findSubtasks(query, sort) {
    return this.db.collection('issues').find(query).sort(sort).toArray()
    .then(issues => {
      const idSet = new Set(issues.map(issue => issue.id));
      let changed = false;
      for (const issue of issues) {
        for (const { relation, to } of issue.linked) {
          if ((relation === 'included-by' || relation === 'includes') && !idSet.has(to)) {
            changed = true;
            idSet.add(to);
          }
        }
      }
      if (!changed) {
        return Promise.resolve(issues);
      }
      return this.findSubtasks({ project: query.project, id: { $in: Array.from(idSet) } }, sort);
    });
  },

  /** Make sure that all linked issues are reciprocal.
      @param {issue} issue The issue we are updating.
      @param {Map} issueRefs A map containing all of the issues that this issue references. This
        includes all references from both before and after the update.
      @return A promise which contains all of the update operations required.
  */
  reconcileLinks(issue, issueRefs) {
    const linksById = new Map(issue.linked.map(ln => [ln.to, ln.relation]));
    const toChange = new Map();
    linksById.forEach((relation, to) => {
      const inv = inverseRelation(relation);
      const toIssue = issueRefs.get(to);
      const existingLink = toIssue.linked.find(ln => ln.to === issue.id);
      if (existingLink) {
        // Change the type of the other issue's relation
        if (existingLink.relation !== inv) {
          existingLink.relation = inv;
          toIssue.change = {
            by: this.user.username,
            at: issue.updated,
            linked: [{ to: issue.id, before: relation, after: inv }],
          };
          toChange.set(toIssue.id, toIssue);
        }
      } else {
        // Add a new relation to the other issue
        toIssue.linked.push({ to: issue.id, relation: inv });
        toIssue.change = {
          by: this.user.username,
          at: issue.updated,
          linked: [{ to: issue.id, after: inv }],
        };
        toChange.set(toIssue.id, toIssue);
      }
    });
    issueRefs.forEach(toIssue => {
      // If the new issue no longer refers to toIssue, then delete the back-reference.
      if (!linksById.has(toIssue.id)) {
        const existingLink = toIssue.linked.find(ln => ln.to === issue.id);
        if (existingLink) {
          toIssue.linked = toIssue.linked.filter(ln => ln.to !== issue.id);
          toIssue.change = {
            by: this.user.username,
            at: issue.updated,
            linked: [{ to: issue.id, before: existingLink.relation }],
          };
          toChange.set(toIssue.id, toIssue);
        }
      }
    });

    // Now update all of the issues that needed changing.
    const updates = [];
    const issues = this.db.collection('issues');
    toChange.forEach(iss => {
      updates.push(
        issues.updateOne(
          { project: iss.project, id: iss.id },
          { $set: { linked: iss.linked }, $push: { changes: iss.change } }));
    });
    return Promise.all(updates).then(() => issue);
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
          // Reconcile linkages
          return issues.findOne(query);
        }, error => {
          logger.error('Error updating issue', id, proj.name, error);
          return Promise.reject(new InternalError());
        });
      });
    });
  },

  searchCustomFields({ project, field, search }) {
    return this.getProjectAndRole({ projectId: project }).then(([proj, role]) => {
      if (proj === null || (!proj.public && role < Role.VIEWER)) {
        return Promise.reject(new NotFound(Errors.PROJECT_NOT_FOUND));
      }
      const fieldPath = `custom.${field}`;
      const terms = search.split(/\s+/).map(t => ({
        [fieldPath]: { $regex: `(^|\\s)${escapeRegExp(t)}`, $options: 'i' },
      }));
      const query = {
        project: new ObjectId(project),
        $and: terms,
      };
      return this.db.collection('issues').find(query).toArray().then(issues => {
        // Count number of occurances of each string
        const results = new Map();
        for (const i of issues) {
          const text = i.custom[field];
          const count = results.get(text) || 0;
          results.set(text, count - 1); // We want most popular to be first
        }
        // Sort by popularity
        const resultList = [];
        results.forEach((count, key) => { resultList.push([count, key]); });
        resultList.sort();
        // Return most popular strings
        return resultList.map(entry => entry[1]).slice(0, 5);
      });
    });
  },
};

module.exports = function (rootClass) {
  Object.assign(rootClass.prototype, resolverMethods);
};
