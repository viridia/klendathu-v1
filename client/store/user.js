import { createReducer } from 'redux-act';
import * as actions from './actions';

export default createReducer({
  [actions.login]: (state, user) => {
    return {
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      photo: user.photo,
      projects: user.projects,
    };
  },

  [actions.logout]: (_state) => {
    return {};
  },
}, null);
