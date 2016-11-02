const { GraphQLInputObjectType, GraphQLString, GraphQLBoolean } = require('graphql');

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
    public: {
      type: GraphQLBoolean,
      description: 'Whether this project is visible to the public.',
    },
    owningUser: {
      type: GraphQLString,
      description: 'If non-null, indicates the id of the user that owns this project.',
    },
    owningOrg: {
      type: GraphQLString,
      description: 'If non-null, indicates the id of the organization that owns this project.',
    },
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
