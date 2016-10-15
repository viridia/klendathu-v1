import React from 'react';
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';
import { env } from '../../globals';

function graphQLFetcher(graphQLParams) {
  return window.fetch(`${env.apiUrl}/gql`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(graphQLParams),
    credentials: 'same-origin',
  }).then(response => response.json());
}

export default class GraphQLPage extends React.Component {
  render() {
    return <GraphiQL fetcher={graphQLFetcher} />;
  }
}
