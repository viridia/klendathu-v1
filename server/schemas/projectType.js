const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull } = require('graphql');
const GraphQLDate = require('graphql-date');

module.exports = new GraphQLObjectType({
  name: 'Project',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Unique name of this project.',
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Short description of the project.',
    },
    description: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A more detailed description of the project.',
    },
    owningUser: { type: GraphQLID },
    owningOrg: { type: GraphQLID },
    created: { type: new GraphQLNonNull(GraphQLDate) },
    updated: { type: new GraphQLNonNull(GraphQLDate) },
  },
});
