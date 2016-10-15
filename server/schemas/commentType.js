const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull } = require('graphql');
const GraphQLDate = require('graphql-date');

module.exports = new GraphQLObjectType({
  name: 'Comment',
  fields: {
    author: {
      type: GraphQLID,
      description: 'Current owner of this issue.',
    },
    body: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Body of the comment.',
    },
    created: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'Date and time when the comment was posted.',
    },
    updated: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'Date and time when the comment was last edited.',
    },
  },
});
