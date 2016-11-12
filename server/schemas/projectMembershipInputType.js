const { GraphQLInputObjectType, GraphQLInt, GraphQLString, GraphQLList, GraphQLNonNull } =
    require('graphql');

const savedFilter = new GraphQLInputObjectType({
  name: 'SavedFilterInput',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Name of this filter.',
    },
    value: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'JSON-encoded filter expression.',
    },
  },
});

module.exports = new GraphQLInputObjectType({
  name: 'ProjectMembershipInput',
  fields: {
    role: {
      type: GraphQLInt,
      description: 'Access level for the this user (direct as project member).',
    },
    labels: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
      description: 'List of labels to display in the hotlist.',
    },
    addLabels: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
      description: 'List of labels to add to the add to the hotlist.',
    },
    removeLabels: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
      description: 'List of labels to remove from the hotlist.',
    },
    filters: {
      type: new GraphQLList(new GraphQLNonNull(savedFilter)),
      description: 'List of saved filters.',
    },
    addFilters: {
      type: new GraphQLList(new GraphQLNonNull(savedFilter)),
      description: 'List of filters to add to the set of saved filters.',
    },
    removeFilters: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: 'List of filter names to remove.',
    },
  },
});
