const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLID, GraphQLNonNull }
  = require('graphql');
const labelType = require('./schemas/labelType');
const userType = require('./schemas/userType');
const projectType = require('./schemas/projectType');
const templateType = require('./schemas/templateType');
const workflowType = require('./schemas/workflowType');
const userResolver = require('./resolvers/user');

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
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
      newProject: {
        type: new GraphQLNonNull(new GraphQLList(projectType)),
        args: {
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
        },
      },
      updateProject: {
        type: new GraphQLNonNull(projectType),
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Id of the project to change.',
          },
          title: {
            type: GraphQLString,
            description: 'Short description of the project.',
          },
          description: {
            type: GraphQLString,
            description: 'A more detailed description of the project.',
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
