import { createAction } from 'redux-act';

export const resetIssue = createAction('RESET_ISSUE');
export const setIssueType = createAction('SET_ISSUE_TYPE');
export const setIssueState = createAction('SET_ISSUE_STATE');
export const setIssueSummary = createAction('SET_ISSUE_SUMMARY');
export const setIssueDescription = createAction('SET_ISSUE_DESCRIPTION');
export const setCustomField = createAction('SET_CUSTOM_FIELD', (key, value) => [key, value]);
export const addIssueCC = createAction('ADD_CC_USER');
export const addIssueComment = createAction('ADD_ISSUE_COMMENT');
