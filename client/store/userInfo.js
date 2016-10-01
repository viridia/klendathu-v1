import { createReducer } from 'redux-act';
import * as actions from './actions';

export default createReducer({
  [actions.requestUserInfo]: (state, id) => {
    const ui = state[id];
    if (ui) {
      return state;
    }
    return { ...state, [id]: { loading: true, loaded: false } };
  },
  [actions.receiveUserInfo]: (state, userInfo) => {
    return Object.assign({}, state, {
      [userInfo.id]: { ...userInfo, loading: false, loaded: true },
    });
  },
}, {});
