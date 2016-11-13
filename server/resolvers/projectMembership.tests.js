/* eslint-env mocha */
const { graphql } = require('graphql');
const { ensure } = require('certainty');
const { createRoot, createUser, reset } = require('../testing/fixtures');
const schema = require('../schema');

describe('resolvers/projectMembership', function () {
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
    // Create a new test project.
    return this.root.newProject({ project: { name: 'test-project' } }).then(project => {
      this.project = project;
      // Helper function to update an issue via graphql
      this.updateProjectMembership = (membership) => {
        return graphql(schema, `mutation UpdateProjectMembership
            ($project: ID!, $user: String!, $membership: ProjectMembershipInput!) {
          updateProjectMembership(project: $project, user: $user, membership: $membership) {
            user
            role
            labels
            filters {
              name
              value
            }
          }
        }`,

        this.root, null, { project: this.project._id, user: this.root.user, membership });
      };
      // Check that the database operation succeeded.
      this.checkResult = (result) => {
        if (result.errors) {
          // console.error(result.errors[0]); // eslint-disable-line
          throw result.errors[0];
        }
      };
    });
  });

  describe('graphql.labels', function () {
    it('set labels from empty', function () {
      return this.updateProjectMembership({
        labels: [1, 2],
      }).then(result => {
        this.checkResult(result);
        const { updateProjectMembership: pm } = result.data;
        ensure(pm.labels).containsExactly(1, 2);
      });
    });

    it('set labels (overwrite)', function () {
      return this.updateProjectMembership({
        labels: [1, 2],
      }).then(() => {
        return this.updateProjectMembership({
          labels: [3, 4],
        }).then(result => {
          this.checkResult(result);
          const { updateProjectMembership: pm } = result.data;
          ensure(pm.labels).containsExactly(3, 4);
        });
      });
    });

    it('add labels (empty)', function () {
      return this.updateProjectMembership({
        addLabels: [3, 4],
      }).then(result => {
        this.checkResult(result);
        const { updateProjectMembership: pm } = result.data;
        ensure(pm.labels).containsExactly(3, 4);
      });
    });

    it('add labels (accumulate)', function () {
      return this.updateProjectMembership({
        labels: [1, 2],
      }).then(() => {
        return this.updateProjectMembership({
          addLabels: [3, 4],
        }).then(result => {
          this.checkResult(result);
          const { updateProjectMembership: pm } = result.data;
          ensure(pm.labels).containsExactly(1, 2, 3, 4);
        });
      });
    });

    it('remove labels', function () {
      return this.updateProjectMembership({
        labels: [1, 2],
      }).then(() => {
        return this.updateProjectMembership({
          removeLabels: [2, 3],
        }).then(result => {
          this.checkResult(result);
          const { updateProjectMembership: pm } = result.data;
          ensure(pm.labels).containsExactly(1);
        });
      });
    });
  });

  describe('graphql.filters', function () {
    it('set filters', function () {
      return this.updateProjectMembership({
        filters: [{ name: 'a', value: 'b' }, { name: 'c', value: 'd' }],
      }).then(result => {
        this.checkResult(result);
        const { updateProjectMembership: pm } = result.data;
        ensure(pm.filters).hasLength(2);
        ensure(pm.filters[0]).hasField('name').withValue('a');
        ensure(pm.filters[0]).hasField('value').withValue('b');
        ensure(pm.filters[1]).hasField('name').withValue('c');
        ensure(pm.filters[1]).hasField('value').withValue('d');
      });
    });

    it('set more filters', function () {
      return this.updateProjectMembership({
        filters: [{ name: 'a', value: 'b' }, { name: 'c', value: 'd' }],
      }).then(() => {
        return this.updateProjectMembership({
          filters: [{ name: 'e', value: 'f' }],
        }).then(result => {
          this.checkResult(result);
          const { updateProjectMembership: pm } = result.data;
          ensure(pm.filters).hasLength(1);
          ensure(pm.filters[0]).hasField('name').withValue('e');
          ensure(pm.filters[0]).hasField('value').withValue('f');
        });
      });
    });

    it('add filters', function () {
      return this.updateProjectMembership({
        addFilters: [{ name: 'a', value: 'b' }, { name: 'c', value: 'd' }],
      }).then(result => {
        this.checkResult(result);
        const { updateProjectMembership: pm } = result.data;
        // console.log(pm);
        ensure(pm.filters).hasLength(2);
        ensure(pm.filters[0]).hasField('name').withValue('a');
        ensure(pm.filters[0]).hasField('value').withValue('b');
        ensure(pm.filters[1]).hasField('name').withValue('c');
        ensure(pm.filters[1]).hasField('value').withValue('d');
      });
    });

    it('add more filters', function () {
      return this.updateProjectMembership({
        filters: [{ name: 'a', value: 'b' }, { name: 'c', value: 'd' }],
      }).then(() => {
        return this.updateProjectMembership({
          addFilters: [{ name: 'a', value: 'd' }, { name: 'e', value: 'f' }],
        }).then(result => {
          this.checkResult(result);
          const { updateProjectMembership: pm } = result.data;
          // console.log(pm);
          ensure(pm.filters).hasLength(3);
          ensure(pm.filters[0]).hasField('name').withValue('a');
          ensure(pm.filters[0]).hasField('value').withValue('d');
          ensure(pm.filters[1]).hasField('name').withValue('c');
          ensure(pm.filters[1]).hasField('value').withValue('d');
          ensure(pm.filters[2]).hasField('name').withValue('e');
          ensure(pm.filters[2]).hasField('value').withValue('f');
        });
      });
    });

    it('remove filters', function () {
      return this.updateProjectMembership({
        filters: [{ name: 'a', value: 'b' }, { name: 'c', value: 'd' }],
      }).then(() => {
        return this.updateProjectMembership({
          removeFilters: ['c'],
        }).then(result => {
          this.checkResult(result);
          const { updateProjectMembership: pm } = result.data;
          ensure(pm.filters).hasLength(1);
          ensure(pm.filters[0]).hasField('name').withValue('a');
          ensure(pm.filters[0]).hasField('value').withValue('b');
        });
      });
    });
  });
});
