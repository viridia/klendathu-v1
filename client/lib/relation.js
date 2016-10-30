const Relation = {
  BLOCKED_BY: 'BLOCKED_BY',
  BLOCKS: 'BLOCKS',
  DUPLICATE: 'DUPLICATE',
  RELATED: 'RELATED',
  INCLUDED_BY: 'INCLUDED_BY',
  INCLUDES: 'INCLUDES',
};

Relation.values = [
  Relation.BLOCKED_BY,
  Relation.BLOCKS,
  Relation.DUPLICATE,
  Relation.RELATED,
  Relation.INCLUDED_BY,
  Relation.INCLUDES,
];

Relation.caption = {
  [Relation.BLOCKED_BY]: 'blocked by',
  [Relation.BLOCKS]: 'blocks',
  [Relation.DUPLICATE]: 'duplicates',
  [Relation.RELATED]: 'related to',
  [Relation.INCLUDED_BY]: 'included by',
  [Relation.INCLUDES]: 'includes',
};

export default Relation;
