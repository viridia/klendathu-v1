import { createAction, createReducer } from 'redux-act';
import Immutable from 'immutable';
import axios from 'axios';

const requestWorkflow = createAction('REQUEST_WORKFLOW');
const receiveWorkflow = createAction('RECEIVE_WORKFLOW');
export const editWorkflow = createAction('EDIT_WORKFLOW');
export const updateWorkflowState = createAction('UPDATE_WORKFLOW_STATE');
export const updateWorkflowStateList = createAction('UPDATE_WORKFLOW_STATE_LIST');
export const addTransition = createAction('ADD_TRANSITION');
export const removeTransition = createAction('REMOVE_TRANSITION');

export function fetchWorkflow(project, name, force = false) {
  return (dispatch, getState) => {
    const qname = `${project}/${name}`;
    const workflow = getState()[qname];
    if (workflow && (workflow.loading || workflow.loaded) && !force) {
      return Promise.resolve();
    }
    dispatch(requestWorkflow(qname));
    return axios.get(`workflows/${qname}`).then(resp => {
      dispatch(receiveWorkflow({ qname, workflow: resp.data.workflow }));
    });
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
        transitions: new Immutable.Set(st.to),
      }])),
    };
  },
  [updateWorkflowState]: (state, newState) => {
    return {
      ...state,
      $stateMap: state.$stateMap.set(newState.id, newState),
    };
  },
  [addTransition]: (state, [fromId, toId]) => {
    const fromState = state.$stateMap.get(fromId);
    return {
      ...state,
      $stateMap: state.$stateMap.set(
          fromId, { ...fromState, transitions: fromState.transitions.add(toId) }),
    };
  },
  [removeTransition]: (state, [fromId, toId]) => {
    const fromState = state.$stateMap.get(fromId);
    return {
      ...state,
      $stateMap: state.$stateMap.set(
          fromId, { ...fromState, transitions: fromState.transitions.delete(toId) }),
    };
  },
  [updateWorkflowStateList]: (state, stateIds) => {
    return {
      ...state,
      $stateIds: stateIds,
    };
  },
}, { $edit: {} });
