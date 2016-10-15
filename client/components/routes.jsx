import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { ApolloProvider } from 'react-apollo';
import Page from './page.jsx';
import ProjectPage from './projectPage.jsx';
import Dashboard from './dashboard/dashboard.jsx';
import IssueDetails from './issues/issueDetails.jsx';
import IssueCompose from './issues/issueCompose.jsx';
import IssueList from './issues/issueList.jsx';
import LabelList from './issues/labelList.jsx';
import ProjectSettings from './settings/projectSettings.jsx';
import ProfilePage from './profile/profilePage.jsx';
import LoginPage from './login/loginPage.jsx';
import SignUpPage from './login/signupPage.jsx';
import GraphQLPage from './debug/graphiql.jsx';
import client from '../store/apollo';
import store from '../store/store';

const Routes = (
  <ApolloProvider store={store} client={client}>
    <Router history={browserHistory}>
      <Route component={LoginPage} path="/login" />
      <Route component={SignUpPage} path="/signup" />
      <Route component={Page} path="/">
        <Route component={GraphQLPage} path="/gql" />
        <Route component={ProjectPage} path="/project/:project">
          <Route component={IssueCompose} path="/project/:project/new" />
          <Route component={IssueDetails} path="/project/:project/issues/:id" />
          <Route component={IssueList} path="/project/:project/issues" />
          <Route component={LabelList} path="/project/:project/labels" />
          <Route component={ProjectSettings} path="/project/:project/settings" />
        </Route>
        <IndexRoute component={Dashboard} />
        <Route component={ProfilePage} path="/profile" />
      </Route>
    </Router>
  </ApolloProvider>
);

export default Routes;
