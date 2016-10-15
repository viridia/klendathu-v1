import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { reducer as toastrReducer } from 'react-redux-toastr';
import issueReducer from './issue';
import labelsReducer from './labels';
import workflowsReducer from './workflows';
import client from './apollo';

const store = createStore(combineReducers({
  issue: issueReducer,
  labels: labelsReducer,
  toastr: toastrReducer,
  workflows: workflowsReducer,
  apollo: client.reducer(),
}), applyMiddleware(thunk, client.middleware()));

export default store;
