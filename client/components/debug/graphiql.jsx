import React from 'react';
import GraphiQL from 'graphiql';
// import axios from 'axios';
import 'graphiql/graphiql.css';
import { env } from '../../globals';

function graphQLFetcher(graphQLParams) {
  return window.fetch(`${env.apiUrl}/gql`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(graphQLParams),
  }).then(response => response.json());
  // return axios.post('gql', graphQLParams).then(resp => {
  //   return resp.data;
  // });
}

export default class GraphQLPage extends React.Component {
  render() {
    return <GraphiQL fetcher={graphQLFetcher} />;
  }
}
