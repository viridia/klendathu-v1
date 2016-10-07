import { createAction, createReducer } from 'redux-act';
import Immutable from 'immutable';
import axios from 'axios';

const requestIssue = createAction('REQUEST_ISSUE');
const receiveIssue = createAction('RECEIVE_ISSUE');
const receiveIssueList = createAction('RECEIVE_ISSUE_LIST');
export const resetIssue = createAction('RESET_ISSUE');
export const setIssueType = createAction('SET_ISSUE_TYPE');
export const setIssueSummary = createAction('SET_ISSUE_SUMMARY');
export const setIssueDescription = createAction('SET_ISSUE_DESCRIPTION');
export const setCustomField = createAction('SET_CUSTOM_FIELD', (key, value) => [key, value]);
export const addIssueCC = createAction('ADD_CC_USER');
export const addIssueComment = createAction('ADD_ISSUE_COMMENT');

export function fetchIssue(id, force = false) {
  return (dispatch, getState) => {
    const issue = getState().byId.get(id);
    if (issue && (issue.loading || issue.loaded) && !force) {
      return Promise.resolve();
    }
    dispatch(requestIssue(id));
    return axios.get(`issues/${id}`).then(resp => {
      dispatch(receiveIssue({ id, issue: resp.data.issue }));
    });
  };
}

export function queryIssues(query) {
  return (dispatch) => {
    return axios.get('issues', { params: query }).then(resp => {
      // Update map of issues
      resp.data.issues.forEach(issue => {
        dispatch(receiveIssue({ id: issue.id, issue }));
      });
      // Update list of issues in order.
      dispatch(receiveIssueList(resp.data.issues.map(issue => issue.id)));
    });
  };
}

export default createReducer({
  [requestIssue]: (state, id) => {
    const issue = state.byId.get(id);
    if (issue) {
      return { ...state, byId: state.byId.set(id, { ...issue, loading: true }) };
    }
    return { ...state, byId: state.byId.set(id, { loading: true, loaded: false }) };
  },
  [receiveIssue]: (state, { id, issue }) => {
    return { ...state,
      byId: state.byId.set(id, {
        ...issue,
        loading: false,
        loaded: true,
      }),
    };
  },
  [resetIssue]: (state) => ({ ...state, $edit: {} }),
  [receiveIssueList]: (state, idList) => ({ ...state, idList }),
  [setIssueType]: (state, type) => ({ ...state, $edit: { ...state.$edit, type } }),
  [setIssueSummary]: (state, summary) => ({ ...state, $edit: { ...state.$edit, summary } }),
  [setIssueDescription]: (state, description) => ({
    ...state,
    $edit: { ...state.$edit, description },
  }),
  [setCustomField]: (state, [key, value]) => {
    const customFields = state.$edit.custom || Immutable.Map.of();
    return {
      ...state,
      $edit: { ...state.$edit, custom: customFields.set(key, value) },
    };
  },
  [addIssueCC]: (state, user) => {
    const ccList = state.$edit.cc || Immutable.OrderedSet.of();
    return {
      ...state,
      $edit: { ...state.$edit, cc: ccList.add(user) },
    };
  },
  [addIssueComment]: (state, comment) => {
    console.log(comment);
    const commentList = state.$edit.comments || Immutable.List.of();
    return {
      ...state,
      $edit: { ...state.$edit, comments: commentList.push(comment) },
    };
  },
}, { $edit: {}, byId: Immutable.Map.of(), idList: [] });
