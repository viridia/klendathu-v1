const { GraphQLInputObjectType, GraphQLInt, GraphQLString, GraphQLList, GraphQLNonNull } =
    require('graphql');

const savedQuery = new GraphQLInputObjectType({
  name: 'SavedQueryInput',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Access level for the this user.',
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
      type: new GraphQLList(GraphQLInt),
      description: 'List of labels to display in the issue summary list.',
    },
    queries: {
      type: new GraphQLList(savedQuery),
      description: 'List of saved queries.',
    },
  },
});
