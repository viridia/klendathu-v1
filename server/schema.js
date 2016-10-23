const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInputObjectType,
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
const projectMembershipType = require('./schemas/projectMembershipType');
const templateType = require('./schemas/templateType');
const workflowType = require('./schemas/workflowType');
const predicateType = require('./schemas/predicateType');

const customSearch = new GraphQLInputObjectType({
  name: 'CustomSearch',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Name of the custom field we are searching for.',
    },
  },
});

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
          search: { type: GraphQLString },
          type: {
            type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
            description: 'Query term that restricts the issue search to a set of types.',
          },
          state: {
            type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
            description: 'Query term that restricts the issue search to a set of states.',
          },
          owner: {
            type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
            description: 'Query term that restricts the issue search to a set of owners.',
          },
          reporter: {
            type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
            description: 'Query term that restricts the issue search to a set of reporters.',
          },
          cc: {
            type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
            description: 'Query term that restricts the issue search to a set of ccs.',
          },
          summary: {
            type: GraphQLString,
            description: 'Query term that searches the summary field.',
          },
          summaryPred: {
            type: predicateType,
            description: 'Search predicate for the summary field.',
            defaultValue: 'in',
          },
          description: {
            type: GraphQLString,
            description: 'Query term that searches the description field.',
          },
          descriptionPred: {
            type: predicateType,
            description: 'Search predicate for the description field.',
            defaultValue: 'in',
          },
          labels: {
            type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
            description: 'Query term that restricts the issue search to a set of label ids.',
          },
          linked: {
            type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
            description: 'Specifies a list of linked issues to search for.',
          },
          comment: {
            type: GraphQLString,
            description: 'Query term that searches the issue comments.',
          },
          commentPred: {
            type: predicateType,
            description: 'Search predicate for the comments.',
            defaultValue: 'in',
          },
          custom: {
            type: new GraphQLList(new GraphQLNonNull(customSearch)),
            description: 'Query term that searches custom fields.',
          },
          sort: {
            type: new GraphQLList(GraphQLString),
            description: 'Query term that specifies the field sort order.',
          },
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
      projectMembership: {
        type: projectMembershipType,
        args: {
          project: { type: GraphQLID },
          user: { type: GraphQLString },
        },
      },
      projectMemberships: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(projectMembershipType))),
        args: {
          project: { type: GraphQLID },
        },
      },
      label: {
        type: labelType,
        args: {
          id: { type: GraphQLInt },
          project: { type: GraphQLID },
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
          username: { type: GraphQLString },
        },
        // This needs to be here because we already have a 'user' field on the root object.
        resolve(root, { username }) {
          return root.singleUser({ username });
        },
      },
      users: {
        type: new GraphQLNonNull(new GraphQLList(userType)),
        args: {
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
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Id of the issue to update.',
          },
          project: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Project containing the issue.',
          },
          issue: {
            type: issueInputType,
            description: 'Contents of the issue to be created.',
          },
        },
      },
      deleteIssue: {
        type: new GraphQLNonNull(GraphQLInt),
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Id of the issue to delete.',
          },
          project: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Project containing the issue.',
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
          project: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Id of the project containing the label to update.',
          },
          id: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Id of the label to update.',
          },
          label: {
            type: labelInputType,
            description: 'Contents of the label to be updated.',
          },
        },
      },
      deleteLabel: {
        type: new GraphQLNonNull(GraphQLInt),
        args: {
          project: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Project containing the label.',
          },
          id: {
            type: new GraphQLNonNull(GraphQLInt),
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
        type: new GraphQLNonNull(GraphQLID),
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
