import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { reducer as toastrReducer } from 'react-redux-toastr';
import issuesReducer from './issues';
import labelsReducer from './labels';
import profileReducer from './profile';
import projectsReducer from './projects';
import templatesReducer from './templates';
import workflowsReducer from './workflows';
import userInfoReducer from './userInfo';
import client from './apollo';

const store = createStore(combineReducers({
  issues: issuesReducer,
  labels: labelsReducer,
  profile: profileReducer,
  projects: projectsReducer,
  templates: templatesReducer,
  toastr: toastrReducer,
  workflows: workflowsReducer,
  userInfo: userInfoReducer,
  apollo: client.reducer(),
}), applyMiddleware(thunk, client.middleware()));

export default store;
