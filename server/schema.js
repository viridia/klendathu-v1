const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLID, GraphQLNonNull }
    = require('graphql');
const issueType = require('./schemas/issueType');
const issueInputType = require('./schemas/issueInputType');
const labelType = require('./schemas/labelType');
const userType = require('./schemas/userType');
const projectType = require('./schemas/projectType');
const projectInputType = require('./schemas/projectInputType');
const templateType = require('./schemas/templateType');
const workflowType = require('./schemas/workflowType');
const userResolver = require('./resolvers/user');

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      issue: {
        type: issueType,
        args: {
          id: { type: GraphQLID },
        },
      },
      issues: {
        type: new GraphQLNonNull(new GraphQLList(issueType)),
        args: {
          project: { type: GraphQLID },
          token: { type: GraphQLString },
        },
      },
      project: {
        type: projectType,
        args: {
          id: { type: GraphQLID },
          name: { type: GraphQLString },
        },
      },
      projects: {
        type: new GraphQLNonNull(new GraphQLList(projectType)),
        args: {
          id: { type: GraphQLID },
          name: { type: GraphQLString },
        },
      },
      labels: {
        type: new GraphQLNonNull(new GraphQLList(labelType)),
        args: {
          id: { type: GraphQLID },
          project: { type: GraphQLID },
          token: { type: GraphQLString },
        },
      },
      workflow: {
        type: workflowType,
        args: {
          project: { type: new GraphQLNonNull(GraphQLString) },
          name: { type: new GraphQLNonNull(GraphQLString) },
        },
      },
      template: {
        type: templateType,
        args: {
          project: { type: new GraphQLNonNull(GraphQLString) },
          name: { type: new GraphQLNonNull(GraphQLString) },
        },
      },
      profile: {
        type: userType,
      },
      user: {
        type: userType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
        },
        // This needs to be here because we already have a 'user' field on the root object.
        resolve({ db }, { id }) {
          return userResolver.user({ id }, { db });
        },
      },
      users: {
        type: new GraphQLNonNull(new GraphQLList(userType)),
        args: {
          id: { type: GraphQLID },
          token: { type: GraphQLString },
        },
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      newIssue: {
        type: new GraphQLNonNull(issueType),
        args: {
          project: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Id of the project the new issue is being added to.',
          },
          issue: {
            type: issueInputType,
            description: 'Contents of the issue to be created.',
          },
        },
      },
      updateIssue: {
        type: new GraphQLNonNull(issueType),
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Id of the issue to update.',
          },
          issue: {
            type: issueInputType,
            description: 'Contents of the issue to be created.',
          },
        },
      },
      deleteIssue: {
        type: new GraphQLNonNull(new GraphQLList(issueType)),
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Id of the issue to delete.',
          },
        },
      },
      newProject: {
        type: new GraphQLNonNull(projectType),
        args: {
          project: {
            type: projectInputType,
            description: 'Contents of the project to be created.',
          },
        },
      },
      updateProject: {
        type: new GraphQLNonNull(projectType),
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Id of the project to update.',
          },
          project: {
            type: projectInputType,
            description: 'Contents of the project to be updated.',
          },
        },
      },
      deleteProject: {
        type: new GraphQLNonNull(new GraphQLList(projectType)),
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Id of the project to delete.',
          },
        },
      },
    },
  }),
});
