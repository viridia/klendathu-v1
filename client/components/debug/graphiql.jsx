import React from 'react';
import GraphiQL from 'graphiql';
import axios from 'axios';
import 'graphiql/graphiql.css';

function graphQLFetcher(graphQLParams) {
  return axios.post('gql', graphQLParams).then(resp => {
    return resp.data;
  });
}

export default class GraphQLPage extends React.Component {
  render() {
    return <GraphiQL fetcher={graphQLFetcher} />;
  }
}
