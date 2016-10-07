import { createAction } from 'redux-act';

export const requestLabels = createAction('REQUEST_LABELS');
export const receiveLabels = createAction('RECEIVE_LABELS');

export const requestQueries = createAction('REQUEST_QUERIES');
export const receiveQueries = createAction('RECEIVE_QUERIES');
