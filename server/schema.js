const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList,
    GraphQLID,
    GraphQLNonNull,
  } = require('graphql');
const issueType = require('./schemas/issueType');
const issueInputType = require('./schemas/issueInputType');
const labelType = require('./schemas/labelType');
const labelInputType = require('./schemas/labelInputType');
const userType = require('./schemas/userType');
const projectType = require('./schemas/projectType');
const projectInputType = require('./schemas/projectInputType');
const templateType = require('./schemas/templateType');
const workflowType = require('./schemas/workflowType');

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      issue: {
        type: issueType,
        args: {
          project: { type: new GraphQLNonNull(GraphQLID) },
          id: { type: new GraphQLNonNull(GraphQLInt) },
        },
      },
      issues: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(issueType))),
        args: {
          project: { type: GraphQLID },
          token: { type: GraphQLString },
          label: { type: GraphQLString },
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
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(projectType))),
        args: {
          id: { type: GraphQLID },
          name: { type: GraphQLString },
        },
      },
      label: {
        type: labelType,
        args: {
          id: { type: GraphQLID },
        },
      },
      labels: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(labelType))),
        args: {
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
        resolve(root, { id }) {
          return root.singleUser({ id });
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
      newLabel: {
        type: new GraphQLNonNull(labelType),
        args: {
          project: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Id of the project the new label is being added to.',
          },
          label: {
            type: labelInputType,
            description: 'Contents of the label to be created.',
          },
        },
      },
      updateLabel: {
        type: new GraphQLNonNull(labelType),
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Id of the label to update.',
          },
          label: {
            type: labelInputType,
            description: 'Contents of the label to be created.',
          },
        },
      },
      deleteLabel: {
        type: new GraphQLNonNull(new GraphQLList(labelType)),
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Id of the label to delete.',
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
