import ApolloClient, { createNetworkInterface, addTypename } from 'apollo-client';
import Immutable from 'immutable';

const networkInterface = createNetworkInterface({
  uri: '/api/gql',
  opts: {
    credentials: 'same-origin',
  },
});

export default new ApolloClient({
  networkInterface,
  queryTransformer: addTypename,
  resultTransformer: queryResult => {
    if (queryResult.data.project) {
      const project = queryResult.data.project;
      // Add map of types by id
      if (project.template) {
        project.template.typesById = Immutable.Map(project.template.types.map(t => [t.id, t]));
      }
      // Add map of states by id
      if (project.workflow) {
        project.workflow.statesById = Immutable.Map(project.workflow.states.map(s => [s.id, s]));
      }
    }
    return queryResult;
  },
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
