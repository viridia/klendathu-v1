import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import axios from 'axios';
import Page from './page.jsx';
import Dashboard from './dashboard/dashboard.jsx';
import IssueDetails from './issues/issueDetails.jsx';
import IssueList from './issues/issueList.jsx';
import LabelList from './issues/labelList.jsx';
import ProjectSettings from './settings/projectSettings.jsx';
import ProfilePage from './profile/profilePage.jsx';
import LoginPage from './login/loginPage.jsx';
import SignUpPage from './login/signupPage.jsx';
import LeftNav from './common/leftNav.jsx';
import store from '../store/store';
import * as actions from '../store/actions';

// Make sure we have a user profile before we enter the main part of the app.
function checkAuth(nextState, replace, callback) {
  const state = store.getState();
  if (state.user === null) {
    axios.get('profile').then(resp => {
      store.dispatch(actions.login(resp.data));
      callback();
    }, reason => {
      console.error('Error fetching user profile:', reason);
      callback();
    });
  } else {
    callback();
  }
}

const Routes = (
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route component={LoginPage} path="/login" />
      <Route component={SignUpPage} path="/signup" />
      <Route component={Page} path="/" onEnter={checkAuth}>
        <Route components={{ main: ProfilePage }} path="/profile" />
        <Route components={{ main: IssueDetails, left: LeftNav }} path="/issues/:project/:id" />
        <Route components={{ main: IssueList, left: LeftNav }} path="/issues/:project" />
        <Route components={{ main: LabelList, left: LeftNav }} path="/labels/:project" />
        <Route components={{ main: ProjectSettings, left: LeftNav }} path="/project/:project" />
        <IndexRoute components={{ main: Dashboard }} />
      </Route>
    </Router>
  </Provider>
);

export default Routes;
