const { GraphQLInputObjectType, GraphQLString } = require('graphql');

module.exports = new GraphQLInputObjectType({
  name: 'ProjectInput',
  fields: {
    name: {
      type: GraphQLString,
      description: 'Unique name of this project.',
    },
    title: {
      type: GraphQLString,
      description: 'Short description of the project.',
    },
    description: {
      type: GraphQLString,
      description: 'A more detailed description of the project.',
    },
    owningUser: { type: GraphQLString },
    owningOrg: { type: GraphQLString },
    templateName: {
      type: GraphQLString,
      description: 'Name of the issue template to use for this project.',
    },
    workflowName: {
      type: GraphQLString,
      description: 'Name of the project workflow to use for this project.',
    },
  },
});
