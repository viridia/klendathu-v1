import ApolloClient, { createNetworkInterface } from 'apollo-client';

const networkInterface = createNetworkInterface({
  uri: '/api/gql',
  opts: {
    credentials: 'same-origin',
  },
});

export default new ApolloClient({
  networkInterface,
  dataIdFromObject: o => o.id && `${o.__typename}:${o.id},`,
  // shouldBatch: true,
});
