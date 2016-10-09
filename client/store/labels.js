import { createAction, createReducer } from 'redux-act';
import Immutable from 'immutable';
import axios from 'axios';

const requestLabel = createAction('REQUEST_LABEL');
const receiveLabel = createAction('RECEIVE_LABEL');

export function createLabel(project, name, color) {
  return (dispatch) => {
    return axios.put('labels', { project, name, color }).then(resp => {
      dispatch(receiveLabel(resp.data));
      return resp;
    });
  };
}

export default createReducer({
  [requestLabel]: (state, id) => {
    const label = state.byId.get(id);
    if (label) {
      return state;
    }
    return { ...state, byId: state.byId.set(id, { loading: true, loaded: false }) };
  },
  [receiveLabel]: (state, label) => {
    return { ...state, byId: state.byId.set(label.id, { label, loading: false, loaded: true }) };
  },
}, { byId: Immutable.Map.of(), byProject: Immutable.Map.of() });
