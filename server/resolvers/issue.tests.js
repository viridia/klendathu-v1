/* eslint-env mocha */
const { graphql } = require('graphql');
const { ensure } = require('certainty');
const { createRoot, createUser, reset } = require('../testing/fixtures');
const schema = require('../schema');

describe('resolvers/issue', function () {
  // Reset the database, create a user and a root object.
  beforeEach(function () {
    return reset().then(() => {
      return createUser({ username: 'test-user', fullname: 'Mr. Test' }).then(user => {
        return createRoot(user).then(root => {
          this.root = root;
        });
      });
    });
  });

  beforeEach(function () {
    return this.root.newProject({ project: { name: 'test-project' } }).then(project => {
      this.project = project;
      this.createIssue = (issue) => {
        return graphql(schema, `mutation newIssue($project: ID!, $issue: IssueInput!) {
          newIssue(project: $project, issue: $issue) {
            id type state summary description owner cc labels custom { name value }
            created updated
          }
        }`,
        this.root, null, { project: this.project._id, issue });
      };
      this.updateIssue = (id, issue) => {
        return graphql(schema, `mutation updateIssue($project: ID!, $id: Int! $issue: IssueInput!) {
          updateIssue(project: $project, id: $id, issue: $issue) {
            id type state summary description owner cc labels custom { name value }
            created updated changes {
              type { before after }
              state { before after }
              summary { before after }
              owner { before after }
              cc { added removed }
              labels { added removed }
              custom { name before after }
            }
          }
        }`,
        this.root, null, { project: this.project._id, id, issue });
      };
    });
  });

  // TODO: Move this.
  describe('graphql.project', function () {
    it('simple project query', function () {
      graphql(schema, '{ projects { id name } }', this.root).then(result => {
        ensure(result.data.projects).hasLength(1);
        ensure(result.data.projects[0].name).equals('test-project');
      });
    });
  });

  describe('graphql.newIssue', function () {
    it('minimal issue', function () {
      return this.createIssue({
        type: 'bug',
        state: 'new',
        summary: 'summary',
      }).then(result => {
        const { newIssue } = result.data;
        ensure(newIssue.type).equals('bug');
        ensure(newIssue.state).equals('new');
        ensure(newIssue.summary).equals('summary');
        ensure(newIssue.description).isNull();
        ensure(newIssue.owner).isNull();
        ensure(newIssue.cc).hasLength(0);
        ensure(newIssue.labels).hasLength(0);
      });
    });

    it('fully-populated issue', function () {
      return this.createIssue({
        type: 'bug',
        state: 'new',
        summary: 'summary',
        owner: 'test-user',
        cc: ['another-user'],
        labels: [1, 2, 3],
        custom: [{ name: 'cname', value: 'cvalue' }],
      }).then(result => {
        const { newIssue } = result.data;
        ensure(newIssue.type).equals('bug');
        ensure(newIssue.state).equals('new');
        ensure(newIssue.summary).equals('summary');
        ensure(newIssue.description).isNull();
        ensure(newIssue.owner).equals('test-user');
        ensure(newIssue.cc).isDeeplyEqualTo(['another-user']);
        ensure(newIssue.labels).isDeeplyEqualTo([1, 2, 3]);
        ensure(newIssue.custom).hasLength(1);
        ensure(newIssue.custom[0]).hasField('name').withValue('cname');
        ensure(newIssue.custom[0]).hasField('value').withValue('cvalue');
      });
    });

    it('should fail if issue has no state', function () {
      return this.createIssue({
        type: 'bug',
        summary: 'summary',
      }).then(result => {
        ensure(result.errors[0].message).includes('missing-field');
      });
    });

    it('should fail if issue has no type', function () {
      return this.createIssue({
        state: 'new',
        summary: 'summary',
      }).then(result => {
        ensure(result.errors[0].message).includes('missing-field');
      });
    });

    it('should fail if issue has no summmary', function () {
      return this.createIssue({
        type: 'bug',
        state: 'new',
      }).then(result => {
        ensure(result.errors[0].message).includes('missing-field');
      });
    });
  });

  describe('graphql.updateIssue', function () {
    beforeEach(function () {
      return this.createIssue({
        type: 'bug',
        state: 'new',
        summary: 'summary',
        owner: 'test-user',
        cc: ['another-user', 'user3'],
        labels: [1, 2, 3],
        custom: [{ name: 'cname', value: 'cvalue' }],
      }).then(result => {
        this.issue = result.data.newIssue;
      });
    });

    it('update issue type', function () {
      return this.updateIssue(this.issue.id, {
        type: 'feature',
      }).then(result => {
        const { updateIssue } = result.data;
        ensure(updateIssue.type).equals('feature');
        ensure(updateIssue.changes[0].type.before).equals('bug');
        ensure(updateIssue.changes[0].type.after).equals('feature');
        ensure(updateIssue.changes[0].state).isNull();
      });
    });

    it('update issue state', function () {
      return this.updateIssue(this.issue.id, {
        state: 'assigned',
      }).then(result => {
        const { updateIssue } = result.data;
        ensure(updateIssue.state).equals('assigned');
        ensure(updateIssue.changes[0].state.before).equals('new');
        ensure(updateIssue.changes[0].state.after).equals('assigned');
      });
    });

    it('update issue summary', function () {
      return this.updateIssue(this.issue.id, {
        summary: 'new text',
      }).then(result => {
        const { updateIssue } = result.data;
        ensure(updateIssue.summary).equals('new text');
        ensure(updateIssue.changes[0].summary.before).equals('summary');
        ensure(updateIssue.changes[0].summary.after).equals('new text');
      });
    });

    it('update issue cc', function () {
      return this.updateIssue(this.issue.id, {
        cc: ['user4', 'user3'],
      }).then(result => {
        const { updateIssue } = result.data;
        ensure(updateIssue.cc).containsExactly('user4', 'user3');
        ensure(updateIssue.changes[0].cc.added).containsExactly('user4');
        ensure(updateIssue.changes[0].cc.removed).containsExactly('another-user');
      });
    });

    it('update issue labels', function () {
      return this.updateIssue(this.issue.id, {
        labels: [3, 4],
      }).then(result => {
        const { updateIssue } = result.data;
        ensure(updateIssue.labels).containsExactly(3, 4);
        ensure(updateIssue.changes[0].labels.added).containsExactly(4);
        ensure(updateIssue.changes[0].labels.removed).containsExactly(1, 2);
      });
    });

    it('update issue custom field', function () {
      return this.updateIssue(this.issue.id, {
        custom: { name: 'a', value: 'b' },
      }).then(result => {
        const { updateIssue } = result.data;
        ensure(updateIssue.custom[0]).hasField('name').withValue('a');
        ensure(updateIssue.custom[0]).hasField('value').withValue('b');
        ensure(updateIssue.changes[0].custom).hasLength(2);
        ensure(updateIssue.changes[0].custom[0]).hasField('name').withValue('a');
        ensure(updateIssue.changes[0].custom[0]).hasField('before').withValue(null);
        ensure(updateIssue.changes[0].custom[0]).hasField('after').withValue('b');
        ensure(updateIssue.changes[0].custom[1]).hasField('name').withValue('cname');
        ensure(updateIssue.changes[0].custom[1]).hasField('before').withValue('cvalue');
        ensure(updateIssue.changes[0].custom[1]).hasField('after').withValue(null);
      });
    });

    // TODO: linked
  });
});
