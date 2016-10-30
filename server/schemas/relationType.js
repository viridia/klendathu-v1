const { GraphQLEnumType } = require('graphql');

module.exports = new GraphQLEnumType({
  name: 'RELATION',
  values: {
    BLOCKED_BY: { value: 'blocked-by' },
    BLOCKS: { value: 'blocks' },
    INCLUDED_BY: { value: 'included-by' },
    INCLUDES: { value: 'includes' },
    DUPLICATE: { value: 'duplicate' },
    RELATED: { value: 'related' },
  },
});
