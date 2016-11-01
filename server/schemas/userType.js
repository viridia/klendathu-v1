const { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLNonNull } = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'User',
  fields: {
    username: {
      type: GraphQLString,
      description: 'Login name of the user. May be null if user hasn\'t completed sign-up.',
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
