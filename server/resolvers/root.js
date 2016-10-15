const { ObjectId } = require('mongodb');
const escapeRegExp = require('../lib/escapeRegExp');
const issueResolver = require('../resolvers/issue');
const projectResolver = require('../resolvers/project');
const templateResolver = require('../resolvers/template');
const workflowResolver = require('../resolvers/workflow');
const userResolver = require('../resolvers/user');

/** The root resolver. */
class RootResolver {
  constructor(db, user) {
    this.db = db;
    this.user = user;
  }

  labels({ id, project: pid, token }) {
    const query = {};
    if (id) {
      query._id = new ObjectId(id);
    }
    if (pid) {
      query.project = new ObjectId(pid);
    }
    if (token) {
      const pattern = `\\b${escapeRegExp(token)}`;
      query.name = { $regex: pattern, $options: 'i' };
    }
    return this.db.collection('labels').find(query).toArray().then(labels => {
      return labels.map(label => {
        const { _id, name, color, project, creator, created, updated } = label;
        return { id: _id, name, color, project, creator, created, updated };
      });
    });
  }

  profile() {
    if (!this.user) { return null; }
    const { _id, username, fullname, photo, verified } = this.user;
    return { id: _id, username, fullname, photo, verified };
  }
}

Object.assign(RootResolver.prototype, {
  deleteProject: projectResolver.delete,
  issue: issueResolver.issue,
  issues: issueResolver.issues,
  newIssue: issueResolver.newIssue,
  newProject: projectResolver.newProject,
  project: projectResolver.project,
  projects: projectResolver.projects,
  template: templateResolver.template,
  updateProject: projectResolver.update,
  users: userResolver.users,
  workflow: workflowResolver.workflow,
});

module.exports = RootResolver;
