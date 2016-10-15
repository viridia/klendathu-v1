import { createAction, createReducer } from 'redux-act';
import Immutable from 'immutable';
import axios from 'axios';
import gql from 'graphql-tag';
import client from './apollo';

export const requestProjects = createAction('REQUEST_PROJECTS');
export const receiveProjects = createAction('RECEIVE_PROJECTS');

// Patch the project with new
export const updateProject = createAction('PATCH_PROJECT', (pid, props) => [pid, props]);

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

const ProjectUpdate = gql`mutation ProjectUpdate($id: ID!, $title: String, $description: String) {
  updateProject(id: $id, description: $description, title: $title) {
    id
    name
    description
    title
  }
}`;

// TODO: Do we even need the dispatch?
export function saveProject(pid, variables) {
  return (/* dispatch*/) => {
    return client.mutate({
      mutation: ProjectUpdate,
      variables: { ...variables, id: pid },
    });
  };
}

export default createReducer({
  // Mark project list as loading.
  [requestProjects]: (state) => ({ ...state, loading: true }),
  [receiveProjects]: (state, projects) => {
    return {
      byId: new Immutable.Map(projects.map(proj => [proj.id, proj])),
      byName: new Immutable.Map(projects.map(proj => [proj.name, proj.id])),
      idList: projects.map(p => p.id),
      loaded: true,
    };
  },
  [updateProject]: (state, [pid, props]) => {
    const proj = state.byId.get(pid);
    if (!proj) {
      return state;
    }
    return { ...state,
      byId: state.byId.set(pid, { ...proj, ...props }),
      byName: state.byName.set(proj.name, pid),
    };
  },
}, {
  byId: Immutable.Map.of(),
  byName: Immutable.Map.of(),
  idList: [],
  loading: false,
  loaded: false,
});
