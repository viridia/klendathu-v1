const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLID, GraphQLList, GraphQLNonNull }
    = require('graphql');
const GraphQLDate = require('graphql-date');
const relationType = require('./relationType');
const changeType = require('./changeType');
const userType = require('./userType');
const labelType = require('./labelType');

const linkedIssueType = new GraphQLObjectType({
  name: 'LinkedIssue',
  fields: {
    to: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'ID of issue to which this is linked.',
    },
    relation: {
      type: new GraphQLNonNull(relationType),
      description: 'Type of the relation.',
    },
  },
});

const commentType = new GraphQLObjectType({
  name: 'Comment',
  fields: {
    author: {
      type: GraphQLID,
      description: 'Current owner of this issue.',
    },
    body: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Body of the comment.',
    },
    created: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'Date and time when the comment was posted.',
    },
    updated: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'Date and time when the comment was last edited.',
    },
  },
});

const customFieldType = new GraphQLObjectType({
  name: 'CustomField',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Name of the custom field.',
    },
    value: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Value of the custom field.',
    },
  },
});

module.exports = new GraphQLObjectType({
  name: 'Issue',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Unique id of this issue.',
    },
    project: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'ID of the project this issue belongs to.',
    },
    type: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'One-line summary of the issue.',
    },
    state: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Current state of this issue.',
    },
    summary: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'One-line summary of the issue.',
    },
    description: {
      type: GraphQLString,
      description: 'Detailed description of the issue.',
    },
    reporter: {
      type: GraphQLID,
      description: 'User that originally reported this issue.',
    },
    owner: {
      type: GraphQLID,
      description: 'Current owner of this issue.',
    },
    ownerData: {
      type: userType,
      description: 'Current owner of this issue, as a User object.',
      resolve(issue, args, context, options) {
        return options.rootValue.singleUser({ username: issue.owner });
      },
    },
    cc: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
      description: 'Users who wish to be informed when this issue is updated.',
    },
    ccData: {
      type: new GraphQLList(new GraphQLNonNull(userType)),
      description: 'Users who wish to be informed when this issue is updated (as User objects).',
      resolve(issue, args, context, options) {
        return issue.cc.map(cc => options.rootValue.singleUser({ username: cc }));
      },
    },
    created: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'Date and time when the issue was created.',
    },
    updated: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'Date and time when the issue was last changed.',
    },
    labels: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
      description: 'Labels associated with this issue.',
    },
    labelsData: {
      type: new GraphQLList(new GraphQLNonNull(labelType)),
      description: 'Labels associated with this issue (expanded).',
      resolve(issue, args, context, options) {
        if (issue.labels.length === 0) {
          return [];
        }
        return options.rootValue.labelsById({ project: issue.project, idList: issue.labels });
      },
    },
    linked: {
      type: new GraphQLList(new GraphQLNonNull(linkedIssueType)),
      description: 'List of issues linked to this one.',
    },
    custom: {
      type: new GraphQLList(new GraphQLNonNull(customFieldType)),
      description: 'List of custom fields for this issue.',
    },
    comments: {
      type: new GraphQLList(new GraphQLNonNull(commentType)),
      description: 'List of comments on this issue.',
    },
    changes: {
      type: new GraphQLList(new GraphQLNonNull(changeType)),
      description: 'List of comments on this issue.',
    },
  },
});
