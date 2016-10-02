import { createAction, createReducer } from 'redux-act';
import axios from 'axios';

const requestUserInfo = createAction('REQUEST_USER_INFO');
const receiveUserInfo = createAction('RECEIVE_USER_INFO');

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

export default createReducer({
  [requestUserInfo]: (state, id) => {
    const ui = state[id];
    if (ui) {
      return state;
    }
    return { ...state, [id]: { loading: true, loaded: false } };
  },
  [receiveUserInfo]: (state, userInfo) => {
    return Object.assign({}, state, {
      [userInfo.id]: { ...userInfo, loading: false, loaded: true },
    });
  },
}, {});
