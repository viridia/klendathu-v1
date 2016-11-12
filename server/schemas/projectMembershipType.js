const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLList, GraphQLNonNull } =
    require('graphql');
const labelType = require('./labelType');

const savedFilter = new GraphQLObjectType({
  name: 'SavedFilter',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Name of this filter.',
    },
    value: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'JSON-encoded filter expression.',
    },
  },
});

module.exports = new GraphQLObjectType({
  name: 'ProjectMembership',
  description: 'Stores the project-specific settings for a user: role, prefs, etc.',
  fields: {
    user: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'User member of this project.',
    },
    role: {
      type: GraphQLInt,
      description: 'Access level for the this user (direct as project member).',
    },
    inheritedRole: {
      type: GraphQLInt,
      description: 'Access level for the this user (indirect as organization member).',
    },
    labels: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
      description: 'List of label names to display in the issue summary list.',
    },
    labelsData: {
      type: new GraphQLList(new GraphQLNonNull(labelType)),
      description: 'List of labels to display in the issue summary list.',
      resolve(pm, args, context, options) {
        if (pm.labels.length === 0) {
          return [];
        }
        return options.rootValue.labelsById({ project: pm.project, idList: pm.labels });
      },
    },
    filters: {
      type: new GraphQLList(new GraphQLNonNull(savedFilter)),
      description: 'List of saved queries.',
      resolve(pm) {
        const result = [];
        if (pm.filters !== undefined) {
          Object.keys(pm.filters).forEach(name => {
            result.push({ name, value: pm.filters[name] });
          });
        }
        return result;
      },
    },
  },
});
