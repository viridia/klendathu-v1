import { createAction, createReducer } from 'redux-act';
import Immutable from 'immutable';
import axios from 'axios';

const requestWorkflow = createAction('REQUEST_WORKFLOW');
const receiveWorkflow = createAction('RECEIVE_WORKFLOW');
export const editWorkflow = createAction('EDIT_WORKFLOW');
export const updateWorkflowState = createAction('UPDATE_WORKFLOW_STATE');
export const updateWorkflowStateList = createAction('UPDATE_WORKFLOW_STATE_LIST');
export const addTransition = createAction('ADD_TRANSITION', (fromId, toId) => [fromId, toId]);
export const removeTransition = createAction('REMOVE_TRANSITION', (fromId, toId) => [fromId, toId]);

export function fetchWorkflow(project, name, force = false) {
  return (dispatch, getState) => {
    const qname = `${project}/${name}`;
    const workflow = getState().workflows[qname];
    if (workflow && (workflow.loading || workflow.loaded) && !force) {
      return Promise.resolve();
    }
    dispatch(requestWorkflow(qname));
    return axios.get(`workflows/${qname}`).then(resp => {
      dispatch(receiveWorkflow({ qname, workflow: resp.data.workflow }));
    });
  };
}

export function saveWorkflow(project, name) {
  return (dispatch, getState) => {
    const qname = `${project}/${name}`;
    const ws = getState().workflows;
    const oldWorkflow = ws[qname] || {};
    const newWorkflow = {
      name: ws.$name,
      project: ws.$project,
      extends: oldWorkflow.extends,
      start: oldWorkflow.start,
      states: ws.$stateIds.map(sid => {
        const state = ws.$stateMap.get(sid);
        return {
          id: sid,
          caption: state.caption,
          closed: state.closed,
          transitions: ws.$stateIds.filter(tid => state.transitions.has(tid)),
          actions: state.actions,
        };
      }),
    };
    console.log(JSON.stringify(newWorkflow, null, 2));
  };
}

export default createReducer({
  [requestWorkflow]: (state, qname) => {
    const workflow = state[qname];
    if (workflow) {
      return { ...state, [qname]: { ...workflow, loading: true } };
    }
    return { ...state, [qname]: { loading: true, loaded: false } };
  },
  [receiveWorkflow]: (state, { qname, workflow }) => {
    const statesById = {};
    workflow.states.forEach(s => { statesById[s.id] = s; });
    return { ...state,
      [qname]: {
        ...workflow,
        statesById,
        loading: false,
        loaded: true,
      },
    };
  },
  [editWorkflow]: (state, workflow) => {
    return {
      ...state,
      $name: workflow.name,
      $project: workflow.project,
      $stateIds: workflow.states.map(st => st.id),
      $stateMap: new Immutable.Map(workflow.states.map(st => [st.id, {
        id: st.id,
        caption: st.caption,
        closed: st.closed,
        transitions: new Immutable.Set(st.transitions),
        actions: st.actions || [],
      }])),
      $modified: false,
    };
  },
  [updateWorkflowState]: (state, [sid, newState]) => {
    return {
      ...state,
      $stateMap: state.$stateMap.set(sid, newState),
      $modified: true,
    };
  },
  [updateWorkflowStateList]: (state, stateIds) => {
    return {
      ...state,
      $stateIds: stateIds,
      $modified: true,
    };
  },
  [addTransition]: (state, [fromId, toId]) => {
    const fromState = state.$stateMap.get(fromId);
    return {
      ...state,
      $stateMap: state.$stateMap.set(
          fromId, { ...fromState, transitions: fromState.transitions.add(toId) }),
      $modified: true,
    };
  },
  [removeTransition]: (state, [fromId, toId]) => {
    const fromState = state.$stateMap.get(fromId);
    return {
      ...state,
      $stateMap: state.$stateMap.set(
          fromId, { ...fromState, transitions: fromState.transitions.delete(toId) }),
      $modified: true,
    };
  },
}, { $edit: {} });
