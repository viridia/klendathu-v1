const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLID, GraphQLNonNull }
    = require('graphql');
const GraphQLDate = require('graphql-date');
const templateType = require('./templateType');
const templateResolver = require('../resolvers/template');
const workflowType = require('./workflowType');
const workflowResolver = require('../resolvers/workflow');

const roleType = new GraphQLObjectType({
  name: 'Role',
  fields: {
    level: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Numeric representation of this role.',
    },
    rank: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Text representation of this role.',
    },
  },
});

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
    role: {
      type: new GraphQLNonNull(roleType),
      description: 'Access level for the current user.',
    },
    template: {
      type: templateType,
      resolve(project, _, { db, user }) {
        return templateResolver.template({ project: 'std', name: 'software' }, { db, user });
      },
    },
    workflow: {
      type: workflowType,
      resolve(project, _, { db, user }) {
        return workflowResolver.workflow({ project: 'std', name: 'bugtrack' }, { db, user });
      },
    },
  },
});
