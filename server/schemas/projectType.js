const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLID, GraphQLNonNull, GraphQLBoolean }
    = require('graphql');
const GraphQLDate = require('graphql-date');
const templateType = require('./templateType');
const workflowType = require('./workflowType');

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
    owningUser: {
      type: GraphQLID,
      description: 'User that owns this project. Null if owned by an organization.',
    },
    owningOrg: {
      type: GraphQLID,
      description: 'Organization that owns this project. Null if owned by a user.',
    },
    created: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'When this project was created.',
    },
    updated: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'When this project was last updated.',
    },
    role: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Access level for the current user.',
    },
    template: {
      type: templateType,
      description: 'Issue template for this project.',
    },
    workflow: {
      type: workflowType,
      description: 'Workflow configuration for this project.',
    },
    public: {
      type: GraphQLBoolean,
      description: 'If true, indicates that this project is visible to the public.',
    },
  },
});
