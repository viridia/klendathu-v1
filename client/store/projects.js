import { createAction, createReducer } from 'redux-act';
import Immutable from 'immutable';
import axios from 'axios';

export const requestProjects = createAction('REQUEST_PROJECTS');
export const receiveProjects = createAction('RECEIVE_PROJECTS');

// Fetch projects action.
export function fetchProjects(force = false) {
  return (dispatch, getState) => {
    const projects = getState().projects;
    if (projects && (projects.loading || projects.loaded) && !force) {
      return Promise.resolve();
    }
    dispatch(requestProjects());
    return axios.get('projects').then(resp => {
      dispatch(receiveProjects(resp.data.projects));
    });
  };
}

export function createProject(project) {
  return (dispatch) => {
    return axios.put('projects', project).then(() => {
      dispatch(fetchProjects(true));
    });
  };
}

export function deleteProject(id) {
  return (dispatch) => {
    return axios.delete(`projects/${id}`).then(() => {
      dispatch(fetchProjects(true));
    });
  };
}

export default createReducer({
  [requestProjects]: (state) => {
    // Mark project list as loading.
    return Object.assign({}, state, { loading: true });
  },
  [receiveProjects]: (state, projects) => {
    return {
      byId: new Immutable.Map(projects.map(proj => [proj.name, proj])),
      idList: projects.map(p => p.name),
      loaded: true,
    };
  },
}, { byId: Immutable.Map.of(), idList: [], loading: false, loaded: false });
