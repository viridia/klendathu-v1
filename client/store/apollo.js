import ApolloClient, { createNetworkInterface, addTypename } from 'apollo-client';

const networkInterface = createNetworkInterface({
  uri: '/api/gql',
  opts: {
    credentials: 'same-origin',
  },
});

export default new ApolloClient({
  networkInterface,
  queryTransformer: addTypename,
  dataIdFromObject: o => {
    if (o.id) {
      if (o.__typename === 'Label' || o.__typename === 'Issue') {
        return `${o.__typename}:${o.project}:${o.id},`;
      } else {
        return `${o.__typename}:${o.id},`;
      }
    }
    return null;
  },
  shouldBatch: true,
});
