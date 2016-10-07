import { createAction, createReducer } from 'redux-act';
import axios from 'axios';

const requestTemplate = createAction('REQUEST_TEMPLATE');
const receiveTemplate = createAction('RECEIVE_TEMPLATE');

export function fetchTemplate(project, name, force = false) {
  return (dispatch, getState) => {
    const qname = `${project}/${name}`;
    const template = getState().templates[qname];
    if (template && (template.loading || template.loaded) && !force) {
      return Promise.resolve();
    }
    dispatch(requestTemplate(qname));
    return axios.get(`templates/${qname}`).then(resp => {
      dispatch(receiveTemplate({ qname, template: resp.data.template }));
    });
  };
}

export default createReducer({
  [requestTemplate]: (state, qname) => {
    const template = state[qname];
    if (template) {
      return { ...state, [qname]: { ...template, loading: true } };
    }
    return { ...state, [qname]: { loading: true, loaded: false } };
  },
  [receiveTemplate]: (state, { qname, template }) => {
    const typesById = {};
    template.types.forEach(t => { typesById[t.id] = t; });
    return { ...state,
      [qname]: {
        ...template,
        typesById,
        loading: false,
        loaded: true,
      },
    };
  },
}, { $edit: {} });
