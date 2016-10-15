const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLNonNull }
    = require('graphql');
const GraphQLDate = require('graphql-date');

const fieldChangeType = new GraphQLObjectType({
  name: 'FieldChange',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Name of the field that changed.',
    },
    before: {
      type: GraphQLString,
      description: 'Value of the field before the change.',
    },
    after: {
      type: GraphQLString,
      description: 'Value of the field after the change.',
    },
  },
});

module.exports = new GraphQLObjectType({
  name: 'Change',
  fields: {
    by: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'ID of the user making this change.',
    },
    at: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'Date and time when the changes were made.',
    },
    fields: {
      type: new GraphQLList(new GraphQLNonNull(fieldChangeType)),
      description: 'List of fields changed.',
    },
  },
});
