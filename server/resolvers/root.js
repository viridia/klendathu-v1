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

require('../resolvers/label')(RootResolver);

module.exports = RootResolver;
