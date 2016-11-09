import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { reducer as toastrReducer } from 'react-redux-toastr';
import workflowsReducer from './workflows';
import filterReducer from './filter';
import issueSelectionReducer from './issueSelection';
import client from './apollo';

const store = createStore(combineReducers({
  toastr: toastrReducer,
  filter: filterReducer,
  issueSelection: issueSelectionReducer,
  workflows: workflowsReducer,
  apollo: client.reducer(),
}), applyMiddleware(thunk, client.middleware()));

export default store;
