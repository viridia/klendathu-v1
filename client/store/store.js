import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { reducer as toastrReducer } from 'react-redux-toastr';
import issuesReducer from './issues';
import profileReducer from './profile';
import projectsReducer from './projects';
import templatesReducer from './templates';
import workflowsReducer from './workflows';
import userInfoReducer from './userInfo';

const store = createStore(combineReducers({
  issues: issuesReducer,
  profile: profileReducer,
  projects: projectsReducer,
  templates: templatesReducer,
  toastr: toastrReducer,
  workflows: workflowsReducer,
  userInfo: userInfoReducer,
}), applyMiddleware(thunk));

export default store;
