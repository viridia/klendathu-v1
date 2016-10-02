import { createAction, createReducer } from 'redux-act';
import axios from 'axios';

const requestWorkflow = createAction('REQUEST_WORKFLOW');
const receiveWorkflow = createAction('RECEIVE_WORKFLOW');

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
}, {});
