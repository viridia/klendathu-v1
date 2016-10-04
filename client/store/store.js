import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { reducer as toastrReducer } from 'react-redux-toastr';
import profileReducer from './profile';
import projectsReducer from './projects';
import workflowsReducer from './workflows';
import userInfoReducer from './userInfo';

const store = createStore(combineReducers({
  profile: profileReducer,
  projects: projectsReducer,
  toastr: toastrReducer,
  userInfo: userInfoReducer,
  workflows: workflowsReducer,
}), applyMiddleware(thunk));

export default store;
