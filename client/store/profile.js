import { createAction, createReducer } from 'redux-act';
import axios from 'axios';

export const requestProfile = createAction('REQUEST_PROFILE');
export const receiveProfile = createAction('RECEIVE_PROFILE');
export const clearProfile = createAction('CLEAR_PROFILE');

export function login(params) {
  return (dispatch) => {
    return axios.post('login', params).then(resp => {
      dispatch(receiveProfile(resp.data));
      return resp;
    });
  };
}

export function logout() {
  return (dispatch) => {
    return axios.post('logout').then(resp => {
      dispatch(clearProfile());
      return resp;
    });
  };
}

export function fetchProfile(force = false) {
  return (dispatch, getState) => {
    const profile = getState().profile;
    if (profile.id && (profile.loading || profile.loaded) && !force) {
      return Promise.resolve();
    }
    dispatch(requestProfile());
    return axios.get('profile').then(resp => {
      dispatch(receiveProfile(resp.data));
      return resp;
    });
  };
}

export default createReducer({
  [requestProfile]: (state) => ({ ...state, loading: true, loaded: false }),
  [receiveProfile]: (state, user) => {
    return {
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      photo: user.photo,
      projects: user.projects,
      loading: false,
      loaded: true,
    };
  },

  [clearProfile]: (_state) => ({ id: null, loading: false, loaded: false }),
}, { id: null, loading: false, loaded: false });
