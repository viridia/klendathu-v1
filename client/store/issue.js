import { createReducer } from 'redux-act';
import Immutable from 'immutable';
import * as actions from './actions';

export default createReducer({
  [actions.resetIssue]: () => ({}),
  [actions.setIssueType]: (state, type) => ({ ...state, type }),
  [actions.setIssueState]: (state, st) => ({ ...state, state: st }),
  [actions.setIssueSummary]: (state, summary) => ({ ...state, summary }),
  [actions.setIssueDescription]: (state, description) => ({ ...state, description }),
  [actions.setCustomField]: (state, [key, value]) => {
    const customFields = state.custom || Immutable.Map.of();
    return { ...state, custom: customFields.set(key, value) };
  },
  [actions.addIssueCC]: (state, user) => {
    const ccList = state.cc || Immutable.OrderedSet.of();
    return { ...state, cc: ccList.add(user) };
  },
  [actions.addIssueComment]: (state, comment) => {
    // console.log(comment);
    const commentList = state.comments || Immutable.List.of();
    return { ...state, comments: commentList.push(comment) };
  },
}, {});
