import { createAction, createReducer } from 'redux-act';
import Immutable from 'immutable';

export const showFilters = createAction('SHOW_FILTERS');
export const addFilterTerm = createAction('ADD_FILTER_TERM');
export const updateFilterTerm = createAction('UPDATE_FILTER_TERM');
export const updateFilterValue = createAction('UPDATE_FILTER_VALUE');
export const updateFilterPredicate = createAction('UPDATE_FILTER_PREDICATE');
export const removeFilterTerm = createAction('REMOVE_FILTER_TERM');
export const setFilterTerms = createAction('SET_FILTER_TERMS');
export const clearFilterTerms = createAction('CLEAR_FILTER_TERMS');

export default createReducer({
  [showFilters]: (state, visible) => ({ ...state, visible }),
  [addFilterTerm]: (state, term) => ({ ...state, terms: state.terms.push(term) }),
  [updateFilterTerm]: (state, [index, term]) => ({ ...state, terms: state.terms.set(index, term) }),
  [updateFilterValue]: (state, [index, value]) =>
    ({ ...state, terms: state.terms.update(index, term => ({ ...term, value })) }),
  [updateFilterPredicate]: (state, [index, predicate]) =>
    ({ ...state, terms: state.terms.update(index, term => ({ ...term, predicate })) }),
  [removeFilterTerm]: (state, index) => ({ ...state, terms: state.terms.remove(index) }),
  [setFilterTerms]: (state, terms) => ({ ...state, terms: new Immutable.List(terms) }),
  [clearFilterTerms]: (state) => ({ ...state, terms: Immutable.List.of() }),
}, { visible: false, terms: Immutable.List.of() });
