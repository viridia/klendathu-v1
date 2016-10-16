const { GraphQLInputObjectType, GraphQLString, GraphQLID } = require('graphql');

module.exports = new GraphQLInputObjectType({
  name: 'LabelInput',
  fields: {
    id: {
      type: GraphQLID,
      description: 'Database id for this label.',
    },
    name: {
      type: GraphQLString,
      description: 'Text of the label.',
    },
    color: {
      type: GraphQLString,
      description: 'Color of the label.',
    },
  },
});
