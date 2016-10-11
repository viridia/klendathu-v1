const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLBoolean, GraphQLNonNull }
  = require('graphql');

const workflowStateType = new GraphQLObjectType({
  name: 'State',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Unique id of this workflow state.',
    },
    caption: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Human-readable name of this workflow state.',
    },
    closed: {
      type: GraphQLBoolean,
      description: 'Whether this state is closed or open.',
    },
    transitions: {
      type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      description: 'List of states which can follow this state.',
    },
  },
});


module.exports = new GraphQLObjectType({
  name: 'Workflow',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Name of this workflow.',
    },
    project: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Project where this workflow is defined.',
    },
    extends: {
      type: GraphQLString,
      description: 'Workflow that this is an extension of.',
    },
    start: {
      type: GraphQLString,
      description: 'Starting state of this workflow.',
    },
    states: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(workflowStateType))),
      description: 'Workflow that this is an extension of.',
    },
  },
});
