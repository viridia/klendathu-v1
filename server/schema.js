const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLBoolean,
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
const projectMembershipInputType = require('./schemas/projectMembershipInputType');
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
        description: 'Retrieve a single issue by id.',
        type: issueType,
        args: {
          project: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Project containing the issue being queried.',
          },
          id: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Id of the issue to retrieve.',
          },
        },
      },
      issues: {
        description: 'Retrieve issues which meet a set of filter criteria.',
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(issueType))),
        args: {
          project: {
            type: GraphQLID,
            description: 'Project containing the issues being queried.',
          },
          search: {
            type: GraphQLString,
            description: 'Text search string.',
          },
          type: {
            type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
            description: 'Query term that restricts the issue search to a set of types.',
          },
          state: {
            type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
            description: 'Query term that restricts the issue search to a set of states.',
          },
          owner: {
            type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
            description: 'Query term that restricts the issue search to a set of owners.',
          },
          reporter: {
            type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
            description: 'Query term that restricts the issue search to a set of reporters.',
          },
          cc: {
            type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
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
          subtasks: {
            type: GraphQLBoolean,
            description: 'Whether to show issues hierarchically (subtasks).',
          },
        },
      },
      issueSearch: {
        description: 'Search for issues by text query, sorted by relevance.',
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(issueType))),
        args: {
          project: { type: GraphQLID },
          search: { type: GraphQLString },
        },
      },
      searchCustomFields: {
        description: 'Search custom field text, used for auto completion.',
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
        args: {
          project: { type: new GraphQLNonNull(GraphQLID) },
          field: { type: new GraphQLNonNull(GraphQLString) },
          search: { type: new GraphQLNonNull(GraphQLString) },
        },
      },
      project: {
        description: 'Retrieve a project record by id or by name.',
        type: projectType,
        args: {
          id: {
            description: 'Id of the project to retrieve.',
            type: GraphQLID,
          },
          name: {
            description: 'Name of the project to retreive.',
            type: GraphQLString,
          },
        },
      },
      projects: {
        description: 'Retrieve a list of projects.',
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(projectType))),
        args: {
          name: {
            type: GraphQLString,
          },
        },
      },
      projectMembership: {
        description: 'Information about a project member, including role and settings.',
        type: projectMembershipType,
        args: {
          project: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Identifier for the project.',
          },
          user: {
            type: GraphQLString,
            description: 'User name of the user. Defaults to current user.',
          },
        },
      },
      projectMemberships: {
        description: 'Information about a project members, including roles and settings.',
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(projectMembershipType))),
        args: {
          project: {
            description: 'Identifier for the project.',
            type: new GraphQLNonNull(GraphQLID),
          },
        },
      },
      label: {
        type: labelType,
        args: {
          id: { type: GraphQLInt },
          project: {
            description: 'Identifier for the project containing the label.',
            type: new GraphQLNonNull(GraphQLID),
          },
        },
      },
      labels: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(labelType))),
        args: {
          project: {
            description: 'Identifier for the project containing the labels.',
            type: GraphQLID,
          },
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
        description: 'Profile of the current logged-in user.',
        type: userType,
      },
      user: {
        description: 'Query information about a user.',
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
        description: 'Look up users matching a search token.',
        type: new GraphQLNonNull(new GraphQLList(userType)),
        args: {
          token: {
            type: GraphQLString,
            description: 'Search token.',
          },
        },
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      newIssue: {
        description: 'Create a new issue record.',
        type: new GraphQLNonNull(issueType),
        args: {
          project: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Id of the project the new issue is being added to.',
          },
          issue: {
            type: new GraphQLNonNull(issueInputType),
            description: 'Contents of the issue to be created.',
          },
        },
      },
      updateIssue: {
        description: 'Update an existing issue record.',
        type: new GraphQLNonNull(issueType),
        args: {
          project: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Project containing the issue.',
          },
          id: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Id of the issue to update.',
          },
          issue: {
            type: new GraphQLNonNull(issueInputType),
            description: 'Contents of the issue to be created.',
          },
        },
      },
      deleteIssue: {
        description: 'Delete an issue record.',
        type: new GraphQLNonNull(GraphQLInt),
        args: {
          project: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Project containing the issue.',
          },
          id: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Id of the issue to delete.',
          },
        },
      },
      addComment: {
        description: 'Add a comment to an issue.',
        type: new GraphQLNonNull(issueType),
        args: {
          project: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Project containing the issue.',
          },
          id: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Id of the issue to update.',
          },
          comment: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'Text of the comment to add.',
          },
        },
      },
      newLabel: {
        description: 'Create a new label.',
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
        description: 'Modify an existing label.',
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
        description: 'Delete a label.',
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
        description: 'Create a new project.',
        type: new GraphQLNonNull(projectType),
        args: {
          project: {
            type: projectInputType,
            description: 'Contents of the project to be created.',
          },
        },
      },
      updateProject: {
        description: 'Modify an existing project.',
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
        description: 'Delete a project.',
        type: new GraphQLNonNull(GraphQLID),
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Id of the project to delete.',
          },
        },
      },
      updateProjectMembership: {
        description: 'Modify the role or settings for a project member.',
        type: new GraphQLNonNull(projectMembershipType),
        args: {
          project: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Reference to project.',
          },
          user: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'Reference to user member of project.',
          },
          membership: {
            type: new GraphQLNonNull(projectMembershipInputType),
            description: 'Membership data to update.',
          },
        },
      },
    },
  }),
});
