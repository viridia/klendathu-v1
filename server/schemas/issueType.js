const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLID, GraphQLList, GraphQLNonNull }
    = require('graphql');
const GraphQLDate = require('graphql-date');
const relationType = require('./relationType');
const changeType = require('./changeType');
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
    cc: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
      description: 'Users who wish to be informed when this issue is updated.',
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
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: 'Labels associated with this issue.',
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
