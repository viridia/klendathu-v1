const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull } = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'Attachment',
  fields: {
    filename: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Name of the attachment.',
    },
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Unique id of this attachment.',
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'URL to download the attachment.',
    },
    thumb: {
      type: GraphQLString,
      description: 'URL of the thumbnail for the attachment, if the type is an image.',
    },
    type: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'MIME type for the attachment.',
    },
  },
});
