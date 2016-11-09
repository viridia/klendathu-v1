import Immutable from 'immutable';
import { defaultValueForType } from './editOperand.jsx';

/** Base class which represents a single term in a filter expression. */
class FilterTerm {
  constructor(project, profile) {
    this.value = defaultValueForType(project, this.dataType);
    this.predicate = null;
    this.project = project;
    this.profile = profile;
  }

  /** Create a clone of this object, with the value changed to the given value. */
  setValue(value) {
    if (this.value === value) {
      return this;
    }
    return {
      __proto__: Object.getPrototypeOf(this),
      ...this,
      value,
    };
  }

  /** Create a clone of this object, with the predicate changed to the given predicate. */
  setPredicate(predicate) {
    if (this.predicate === predicate) {
      return this;
    }
    return {
      __proto__: Object.getPrototypeOf(this),
      ...this,
      predicate,
    };
  }
}

class StateFilter extends FilterTerm {
  static get caption() { return 'State'; }
  static get dataType() { return 'stateSet'; }
  static parseQuery(project, profile, query) {
    const result = new StateFilter(project, profile);
    if (query.state === 'open') {
      result.value = defaultValueForType(project, StateFilter.dataType);
    } else {
      result.value = new Immutable.Set(query.state.split(','));
    }
    return result;
  }
}

class TypeFilter extends FilterTerm {
  static get caption() { return 'Type'; }
  static get dataType() { return 'typeSet'; }
  static parseQuery(project, profile, query) {
    const result = new TypeFilter(project, profile);
    result.value = new Immutable.Set(query.type.split(','));
    return result;
  }
}

class SummaryFilter extends FilterTerm {
  static get caption() { return 'Summary'; }
  static get dataType() { return 'searchText'; }
  static parseQuery(project, profile, query) {
    const result = new SummaryFilter(project, profile);
    result.value = query.summary;
    result.predicate = query.summaryPred;
    return result;
  }
}

class DescriptionFilter extends FilterTerm {
  static get caption() { return 'Description'; }
  static get dataType() { return 'searchText'; }
  static parseQuery(project, profile, query) {
    const result = new DescriptionFilter(project, profile);
    result.value = query.description;
    result.predicate = query.descriptionPred;
    return result;
  }
}

class ReporterFilter extends FilterTerm {
  static get caption() { return 'Reporter'; }
  static get dataType() { return 'user'; }
}

class OwnerFilter extends FilterTerm {
  static get caption() { return 'Owner'; }
  static get dataType() { return 'user'; }
}

class CcFilter extends FilterTerm {
  static get caption() { return 'CC'; }
  static get dataType() { return 'users'; }
}

class LabelsFilter extends FilterTerm {
  static get caption() { return 'Labels'; }
  static get dataType() { return 'labels'; }
}

// custom fields (hardware, etc)
// comments / commenter
// linked
// created
// updated
// keywords

export default new Immutable.OrderedMap({
  state: StateFilter,
  type: TypeFilter,
  summary: SummaryFilter,
  description: DescriptionFilter,
  reporter: ReporterFilter,
  owner: OwnerFilter,
  cc: CcFilter,
  labels: LabelsFilter,
});
