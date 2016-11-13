const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLEnumType, GraphQLBoolean,
    GraphQLNonNull } = require('graphql');

const fieldType = new GraphQLObjectType({
  name: 'Field',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Unique id of this field.',
    },
    caption: {
      type: GraphQLString,
      description: 'Label for this field.',
    },
    type: {
      type: new GraphQLNonNull(new GraphQLEnumType({
        name: 'DATA_TYPE',
        values: {
          TEXT: { value: 'text' },
          ENUM: { value: 'enum' },
        },
      })),
      description: 'Data type for this field.',
    },
    default: {
      type: GraphQLString,
      description: 'Default value for this field.',
    },
    align: {
      type: GraphQLString,
      description: 'Whether this field should be center-aligned in the issue list column.',
    },
    values: {
      type: new GraphQLList(GraphQLString),
      description: 'List of valid values for this type.',
    },
  },
});

const issueType = new GraphQLObjectType({
  name: 'Type',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Unique id of this issue type.',
    },
    caption: {
      type: GraphQLString,
      description: 'Name of this issue type.',
    },
    abstract: {
      type: GraphQLBoolean,
      description: 'If false, means you cannot create issues of this type.',
    },
    extends: {
      type: GraphQLString,
      description: 'Issue type that this inherits from.',
    },
    bg: {
      type: GraphQLString,
      description: 'Background color for this type.',
    },
    fields: {
      type: new GraphQLList(new GraphQLNonNull(fieldType)),
      description: 'List of field definitions for this issue type.',
    },
  },
});

module.exports = new GraphQLObjectType({
  name: 'Template',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Name of this workflow.',
    },
    project: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Project where this workflow is defined.',
    },
    types: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(issueType))),
      description: 'List of issue types for this template.',
    },
  },
});
