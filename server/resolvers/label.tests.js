/* eslint-env mocha */
// const graphql = require('graphql');
const certainty = require('certainty');
const { createRoot, createUser, reset } = require('../testing/fixtures');
// const schema = require('../schema');

describe('resolvers/label', function () {
  // Reset the database, create a user and a root object.
  before(function () {
    return reset().then(() => {
      return createUser({ username: 'test-user', fullname: 'Mr. Test' }).then(user => {
        return createRoot(user).then(root => {
          this.root = root;
        });
      });
    });
  });

  before(function () {
    return this.root.newProject({ project: { name: 'test-project' } }).then(project => {
      this.project = project;
      return this.root.newLabel({
        project: project._id,
        label: { name: 'test-label', color: 'test-color' } })
      .then(result => {
        this.label = result;
      });
    });
  });

  describe('query.label', function () {
    it('should return null if there are no labels.', function () {
      return this.root.label({ project: this.project._id, id: 1 }).then(result => {
        certainty.ensure(result).isNull();
      });
    });
    it('should return a label if it exists.', function () {
      return this.root.label({ project: this.project._id, id: this.label.id }).then(result => {
        certainty.ensure(result).named('label').isNotNull();
        certainty.ensure(result).named('label').hasField('name').withValue('test-label');
        certainty.ensure(result).named('label').hasField('color').withValue('test-color');
        certainty.ensure(result).named('label').hasField('creator');
      });
    });
  });
});
