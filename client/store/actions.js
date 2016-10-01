import axios from 'axios';
import { createAction } from 'redux-act';

export const login = createAction('LOGIN');
export const logout = createAction('LOGOUT');

export const requestIssues = createAction('REQUEST_ISSUES');
export const receiveIssues = createAction('RECEIVE_ISSUES');

export const requestLabels = createAction('REQUEST_LABELS');
export const receiveLabels = createAction('RECEIVE_LABELS');

export const requestQueries = createAction('REQUEST_QUERIES');
export const receiveQueries = createAction('RECEIVE_QUERIES');

export const requestUserInfo = createAction('REQUEST_USER_INFO');
export const receiveUserInfo = createAction('RECEIVE_USER_INFO');

export function fetchUserInfo(id) {
  return (dispatch, getState) => {
    const ui = getState().userInfo[id];
    if (ui && (ui.loading || ui.loaded)) {
      return Promise.resolve();
    }
    dispatch(requestUserInfo(id));
    return axios.get(`user/${id}`).then(resp => {
      dispatch(receiveUserInfo(resp.data));
    });
  };
}
