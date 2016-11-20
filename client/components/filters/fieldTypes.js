import Immutable from 'immutable';
import UserQuery from '../../graphql/queries/user.graphql';
import { defaultValueForType } from './editOperand.jsx';

function getUser(context, username) {
  return context.client.query({
    query: UserQuery,
    variables: { user: username },
  }).then(resp => {
    return resp.data;
  });
}

const FIELD_TYPES = new Immutable.OrderedMap({
  state: {
    caption: 'State',
    type: 'stateSet',
    buildQuery: (query, term) => {
      if (term.value) {
        query.state = term.value.toArray().join(',');
      }
    },
    parseQuery(query, context) {
      const state = query.get('state');
      if (state === 'open') {
        return { ...this, value: defaultValueForType(context.project, this.type) };
      }
      return { ...this, value: new Immutable.Set(state.split(',')) };
    },
  },
  type: {
    caption: 'Type',
    type: 'typeSet',
    buildQuery: (query, term) => {
      if (term.value) {
        query.type = term.value.toArray().join(',');
      }
    },
    parseQuery(query) {
      const type = query.get('type');
      return { ...this, value: new Immutable.Set(type.split(',')) };
    },
  },
  summary: {
    caption: 'Summary',
    type: 'searchText',
    buildQuery: (query, term) => {
      query.summary = term.value;
      if (term.predicate) {
        query.summaryPred = term.predicate;
      }
    },
    parseQuery(query) {
      return { ...this, value: query.get('summary'), predicate: query.get('summaryPred') };
    },
  },
  description: {
    caption: 'Description',
    type: 'searchText',
    buildQuery: (query, term) => {
      query.description = term.value;
      if (term.predicate) {
        query.descriptionPred = term.predicate;
      }
    },
    parseQuery(query) {
      return { ...this, value: query.get('description'), predicate: query.get('descriptionPred') };
    },
  },
  reporter: {
    caption: 'Reporter',
    type: 'user',
    buildQuery: (query, term) => {
      if (term.value && term.value.username) {
        query.reporter = term.value.username;
      } else {
        query.reporter = 'none';
      }
    },
    parseQuery(query, context) {
      const reporter = query.get('reporter');
      if (reporter === 'none' || !reporter) {
        return { ...this, value: null };
      } else if (reporter === 'me') {
        return { ...this, value: context.profile };
      }
      return getUser(context, reporter).then(user => ({ ...this, value: user }));
    },
  },
  owner: {
    caption: 'Owner',
    type: 'user',
    buildQuery: (query, term) => {
      if (term.value && term.value.username) {
        query.owner = term.value.username;
      } else {
        query.owner = 'none';
      }
    },
    parseQuery(query, context) {
      const owner = query.get('owner');
      if (owner === 'none' || !owner) {
        return { ...this, value: null };
      } else if (owner === 'me') {
        return { ...this, value: context.profile };
      }
      return getUser(context, owner).then(user => ({ ...this, value: user }));
    },
  },
  cc: {
    caption: 'CC',
    type: 'users',
    buildQuery: (query, term) => {
      if (term.value && term.value.username) {
        query.cc = term.value.username;
      }
    },
  },
  labels: {
    caption: 'Labels',
    type: 'label',
    buildQuery: (query, term) => {
      console.log(term);
    },
  },
  // keywords: {
  //   caption: 'Keywords',
  //   type: 'text[]',
  //   buildQuery: (query, term) => {
  //     console.log(term);
  //   },
  // },
});

export function getFieldType(project, fieldId) {
  if (fieldId.startsWith('custom.')) {
    const customField = project.template.customFieldsById.get(fieldId.slice(7));
    if (customField) {
      switch (customField.type) {
        case 'ENUM':
          return {
            caption: customField.caption,
            type: 'enum',
            customField,
            buildQuery: (query, term) => {
              query[fieldId] = term.value.toArray().join(',');
            },
            parseQuery(query) {
              const param = query.get(fieldId);
              return { ...this, value: new Immutable.Set(param.split(',')) };
            },
          };
        case 'TEXT':
          return {
            caption: customField.caption,
            type: 'text',
            customField,
            buildQuery: (query, term) => {
              query[fieldId] = term.value;
            },
            parseQuery(query) {
              return { ...this, value: query.get(fieldId) };
            },
          };
        default:
          throw new Error(`Invalid custom field type: ${customField.type}`);
      }
    }
    return null;
  }
  return FIELD_TYPES.get(fieldId);
}

export default FIELD_TYPES;
