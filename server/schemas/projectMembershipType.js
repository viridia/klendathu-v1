const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLNonNull } = require('graphql');
const userType = require('./userType');

const savedQuery = new GraphQLObjectType({
  name: 'savedQuery',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Access level for the this user.',
    },
  },
});

module.exports = new GraphQLObjectType({
  name: 'ProjectMembership',
  fields: {
    user: {
      type: new GraphQLNonNull(userType),
      description: 'User member of this project.',
    },
    role: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Access level for the this user (direct as project member).',
    },
    inheritedRole: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Access level for the this user (indirect as organization member).',
    },
    labels: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'List of labels to display in the issue summary list.',
    },
    queries: {
      type: new GraphQLNonNull(savedQuery),
      description: 'List of saved queries.',
    },
  },
});
