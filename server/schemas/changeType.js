const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLID, GraphQLList, GraphQLNonNull }
    = require('graphql');
const GraphQLDate = require('graphql-date');
const relationType = require('./relationType');
const attachmentType = require('./attachmentType');

const scalarChangeType = new GraphQLObjectType({
  name: 'ScalarChange',
  fields: {
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

const listChangeType = new GraphQLObjectType({
  name: 'ListChange',
  fields: {
    added: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: 'List of entries that were added to the field.',
    },
    removed: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: 'List of entries that were removed from the field.',
    },
  },
});

const intListChangeType = new GraphQLObjectType({
  name: 'IntListChange',
  fields: {
    added: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
      description: 'List of entries that were added to the field.',
    },
    removed: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
      description: 'List of entries that were removed from the field.',
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
    type: {
      type: scalarChangeType,
      description: 'Change to the issue type.',
    },
    state: {
      type: scalarChangeType,
      description: 'Change to the issue state.',
    },
    summary: {
      type: scalarChangeType,
      description: 'Change to the issue summary.',
    },
    description: {
      type: scalarChangeType,
      description: 'Change to the issue description.',
    },
    owner: {
      type: scalarChangeType,
      description: 'Change to the issue owner.',
    },
    cc: {
      type: listChangeType,
      description: 'Change to the issue cc list.',
    },
    labels: {
      type: intListChangeType,
      description: 'Change to the list of issue labels.',
    },
    attachments: {
      type: new GraphQLObjectType({
        name: 'AttachmentsChange',
        fields: {
          added: {
            type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
            description: 'List of attachments that were added to the issue.',
          },
          addedData: {
            type: new GraphQLList(new GraphQLNonNull(attachmentType)),
            description: 'Details about the attachments that were added to the issue.',
            resolve(change, args, context, options) {
              if (change.added.length === 0) {
                return [];
              }
              return options.rootValue.attachmentsById({ idList: change.added });
            },
          },
          removed: {
            type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
            description: 'List of attachments that were remove from the issue.',
          },
          removedData: {
            type: new GraphQLList(new GraphQLNonNull(attachmentType)),
            description: 'Details about the attachments that were removed from the issue.',
            resolve(change, args, context, options) {
              if (change.removed.length === 0) {
                return [];
              }
              return options.rootValue.attachmentsById({ idList: change.removed });
            },
          },
        },
      }),
      description: 'Change to the issue attachment list.',
    },
    custom: {
      type: new GraphQLList(new GraphQLNonNull(new GraphQLObjectType({
        name: 'CustomChange',
        fields: {
          name: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'Name of the custom field.',
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
      }))),
      description: 'Change to the list of custom fields.',
    },
    linked: {
      type: new GraphQLList(new GraphQLNonNull(new GraphQLObjectType({
        name: 'LinkChange',
        fields: {
          to: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'ID of the issue being linked to.',
          },
          before: {
            type: relationType,
            description: 'Relationship before the change.',
          },
          after: {
            type: relationType,
            description: 'Relationship after the change.',
          },
        },
      }))),
      description: 'Change to the list of linked issues.',
    },
  },
});
