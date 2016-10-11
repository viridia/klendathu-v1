const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull } = require('graphql');
const GraphQLDate = require('graphql-date');

module.exports = new GraphQLObjectType({
  name: 'Label',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Database id for this label.',
    },
    name: { type: new GraphQLNonNull(GraphQLString) },
    color: { type: new GraphQLNonNull(GraphQLString) },
    project: { type: new GraphQLNonNull(GraphQLID) },
    creator: { type: new GraphQLNonNull(GraphQLID) },
    created: { type: new GraphQLNonNull(GraphQLDate) },
    updated: { type: new GraphQLNonNull(GraphQLDate) },
  },
});
