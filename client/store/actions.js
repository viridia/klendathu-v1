import { createAction } from 'redux-act';

export const requestIssues = createAction('REQUEST_ISSUES');
export const receiveIssues = createAction('RECEIVE_ISSUES');

export const requestLabels = createAction('REQUEST_LABELS');
export const receiveLabels = createAction('RECEIVE_LABELS');

export const requestQueries = createAction('REQUEST_QUERIES');
export const receiveQueries = createAction('RECEIVE_QUERIES');
