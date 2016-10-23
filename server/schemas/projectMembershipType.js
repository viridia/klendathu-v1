const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLList, GraphQLNonNull } =
    require('graphql');

const savedQuery = new GraphQLObjectType({
  name: 'SavedQuery',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Access level for the this user.',
    },
  },
});

module.exports = new GraphQLObjectType({
  name: 'ProjectMembership',
  description: 'Stores the project-specific settings for a user: role, prefs, etc.',
  fields: {
    user: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'User member of this project.',
    },
    role: {
      type: GraphQLInt,
      description: 'Access level for the this user (direct as project member).',
    },
    inheritedRole: {
      type: GraphQLInt,
      description: 'Access level for the this user (indirect as organization member).',
    },
    labels: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
      description: 'List of labels to display in the issue summary list.',
    },
    queries: {
      type: new GraphQLList(new GraphQLNonNull(savedQuery)),
      description: 'List of saved queries.',
    },
  },
});
