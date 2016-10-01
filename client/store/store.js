import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import userReducer from './user';
import projectsReducer from './projects';
import userInfoReducer from './userInfo';

const store = createStore(combineReducers({
  projects: projectsReducer,
  user: userReducer,
  userInfo: userInfoReducer,
}), applyMiddleware(thunk));

export default store;
