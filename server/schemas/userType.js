const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLBoolean, GraphQLNonNull }
    = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Database id for this user.',
    },
    username: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Login name of the user.',
    },
    fullname: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The user\'s full name.',
    },
    photo: { type: GraphQLString },
    verified: { type: GraphQLBoolean },
    // created: { type: GraphQLDate },
    // updated: { type: GraphQLDate },
  },
});
