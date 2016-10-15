const { GraphQLEnumType } = require('graphql');

module.exports = new GraphQLEnumType({
  name: 'RELATION',
  values: {
    BLOCKED_BY: { value: 'blocked_by' },
    BLOCKS: { value: 'blocks' },
    INCLUDED_BY: { value: 'included_by' },
    INCLUDES: { value: 'includes' },
    DUPLICATE_OF: { value: 'duplicate_of' },
    HAS_DUPLICATE: { value: 'has_duplicate' },
    RELATED: { value: 'related' },
  },
});
