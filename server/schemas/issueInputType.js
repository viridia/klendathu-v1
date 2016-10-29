const { GraphQLInputObjectType, GraphQLInt, GraphQLString, GraphQLID, GraphQLList,
    GraphQLNonNull } = require('graphql');
const relationType = require('./relationType');

const linkedIssueInputType = new GraphQLInputObjectType({
  name: 'LinkedIssueInput',
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

const commentInputType = new GraphQLInputObjectType({
  name: 'CommentInput',
  fields: {
    id: {
      type: GraphQLInt,
      description: 'Numeric id of this comment.',
    },
    author: {
      type: GraphQLString,
      description: 'Current owner of this issue.',
    },
    body: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Body of the comment.',
    },
  },
});

const customFieldInputType = new GraphQLInputObjectType({
  name: 'CustomFieldInput',
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

module.exports = new GraphQLInputObjectType({
  name: 'IssueInput',
  fields: {
    type: {
      type: GraphQLString,
      description: 'One-line summary of the issue.',
    },
    state: {
      type: GraphQLString,
      description: 'Current state of this issue.',
    },
    summary: {
      type: GraphQLString,
      description: 'One-line summary of the issue.',
    },
    description: {
      type: GraphQLString,
      description: 'Detailed description of the issue.',
    },
    owner: {
      type: GraphQLString,
      description: 'Current owner of this issue.',
    },
    cc: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: 'Users who wish to be informed when this issue is updated.',
    },
    labels: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
      description: 'Labels associated with this issue.',
    },
    linked: {
      type: new GraphQLList(new GraphQLNonNull(linkedIssueInputType)),
      description: 'List of issues linked to this one.',
    },
    custom: {
      type: new GraphQLList(new GraphQLNonNull(customFieldInputType)),
      description: 'List of custom fields for this issue.',
    },
    comments: {
      type: new GraphQLList(new GraphQLNonNull(commentInputType)),
      description: 'List of comments on this issue.',
    },
  },
});
