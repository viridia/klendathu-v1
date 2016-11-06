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

const workflowActionsType = new GraphQLObjectType({
  name: 'Actions',
  fields: {
    caption: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Title of this action.',
    },
    state: {
      type: GraphQLString,
      description: 'State to transition to.',
    },
    owner: {
      type: GraphQLString,
      description: 'Owner to assign to.',
    },
    require: {
      type: new GraphQLObjectType({
        name: 'ActionRequirements',
        fields: {
          state: {
            type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
            description: 'List of allowable states for this action.',
          },
        },
      }),
      description: 'Prerequisites for this action.',
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
    actions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(workflowActionsType))),
      description: 'Shortcut actions for this workflow.',
    },
  },
});
