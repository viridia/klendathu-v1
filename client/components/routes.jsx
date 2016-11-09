import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { ApolloProvider } from 'react-apollo';
import { AppContainer } from 'react-hot-loader';
import Page from './page.jsx';
import ProjectPage from './projectPage.jsx';
import DashboardPage from './dashboard/dashboardPage.jsx';
import Dashboard from './dashboard/dashboard.jsx';
import IssueDetails from './issues/issueDetails.jsx';
import IssueCreate from './issues/issueCreate.jsx';
import IssueEdit from './issues/issueEdit.jsx';
import IssueSummaryView from './issues/issueSummaryView.jsx';
import LabelList from './labels/labelList.jsx';
import ProjectSettings from './settings/projectSettings.jsx';
import ProfilePage from './profile/profilePage.jsx';
import LoginPage from './login/loginPage.jsx';
import SignUpPage from './login/signupPage.jsx';
import FinishSignUpPage from './login/finishSignupPage.jsx';
import GraphQLPage from './debug/graphiql.jsx';
import NotFound from './common/notFound.jsx';
import client from '../store/apollo';
import store from '../store/store';

const Routes = (
  <ApolloProvider store={store} client={client}>
    <AppContainer>
      <Router history={browserHistory}>
        <Route component={LoginPage} path="/login" />
        <Route component={SignUpPage} path="/signup" />
        <Route component={FinishSignUpPage} path="/finishSignup" />
        <Route component={Page} path="/">
          <Route component={GraphQLPage} path="/gql" />
          <Route component={ProjectPage} path="/project/:project">
            <Route component={IssueCreate} path="/project/:project/new" />
            <Route component={IssueEdit} path="/project/:project/edit/:id" />
            <Route component={IssueDetails} path="/project/:project/issues/:id" />
            <Route component={IssueSummaryView} path="/project/:project/issues" />
            <Route component={LabelList} path="/project/:project/labels" />
            <Route component={ProjectSettings} path="/project/:project/settings" />
            <IndexRoute component={Dashboard} />
          </Route>
          <IndexRoute component={DashboardPage} />
          <Route component={ProfilePage} path="/profile" />
          <Route component={NotFound} path="*" />
        </Route>
      </Router>
    </AppContainer>
  </ApolloProvider>
);

export default Routes;
