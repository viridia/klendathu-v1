const { GraphQLEnumType } = require('graphql');

module.exports = new GraphQLEnumType({
  name: 'PREDICATE',
  values: {
    IN: { value: 'in' },
    EQUALS: { value: 'eq' },
    NOT_IN: { value: '!in' },
    NOT_EQUALS: { value: '!eq' },
    // REGEX: { value: 're' },
    STARTS_WITH: { value: 'sw' },
    ENDS_WITH: { value: 'ew' },
    NOT_REGEX: { value: '!re' },
    GREATER: { value: 'gt' },
    GREATER_EQUAL: { value: 'ge' },
    LESS: { value: 'lt' },
    LESS_EQUAL: { value: 'le' },
  },
});
