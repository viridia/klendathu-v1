import { createAction, createReducer } from 'redux-act';
import Immutable from 'immutable';

export const clearSelection = createAction('CLEAR_SELECTION');
export const selectIssues = createAction('SELECT_ISSUES');
export const deselectIssues = createAction('DESELECT_ISSUES');

export default createReducer({
  [clearSelection]: (state) => {
    return state.clear();
  },
  [selectIssues]: (state, idList) => {
    return state.union(idList);
  },
  [deselectIssues]: (state, idList) => {
    return state.subtract(idList);
  },
}, Immutable.Set.of());
