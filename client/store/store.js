import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import profileReducer from './profile';
import projectsReducer from './projects';
import userInfoReducer from './userInfo';

const store = createStore(combineReducers({
  profile: profileReducer,
  projects: projectsReducer,
  userInfo: userInfoReducer,
}), applyMiddleware(thunk));

export default store;
