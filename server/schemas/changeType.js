const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLID, GraphQLList, GraphQLNonNull }
    = require('graphql');
const GraphQLDate = require('graphql-date');

const scalarChangeType = new GraphQLObjectType({
  name: 'ScalarChange',
  fields: {
    before: {
      type: GraphQLString,
      description: 'Value of the field before the change.',
    },
    after: {
      type: GraphQLString,
      description: 'Value of the field after the change.',
    },
  },
});

const listChangeType = new GraphQLObjectType({
  name: 'ListChange',
  fields: {
    added: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: 'List of entries that were added to the field.',
    },
    removed: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: 'List of entries that were removed from the field.',
    },
  },
});

const intListChangeType = new GraphQLObjectType({
  name: 'IntListChange',
  fields: {
    added: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
      description: 'List of entries that were added to the field.',
    },
    removed: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
      description: 'List of entries that were removed from the field.',
    },
  },
});

const mapChangeType = new GraphQLObjectType({
  name: 'MapChange',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'List of entries that were added to the field.',
    },
    before: {
      type: GraphQLString,
      description: 'Value of the field before the change.',
    },
    after: {
      type: GraphQLString,
      description: 'Value of the field after the change.',
    },
  },
});

module.exports = new GraphQLObjectType({
  name: 'Change',
  fields: {
    by: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'ID of the user making this change.',
    },
    at: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'Date and time when the changes were made.',
    },
    type: {
      type: scalarChangeType,
      description: 'Change to the issue type.',
    },
    state: {
      type: scalarChangeType,
      description: 'Change to the issue state.',
    },
    summary: {
      type: scalarChangeType,
      description: 'Change to the issue summary.',
    },
    description: {
      type: scalarChangeType,
      description: 'Change to the issue description.',
    },
    owner: {
      type: scalarChangeType,
      description: 'Change to the issue owner.',
    },
    cc: {
      type: listChangeType,
      description: 'Change to the issue cc list.',
    },
    labels: {
      type: intListChangeType,
      description: 'Change to the list of issue labels.',
    },
    custom: {
      type: new GraphQLList(new GraphQLNonNull(mapChangeType)),
      description: 'Change to the list of issue labels.',
    },
  },
});
