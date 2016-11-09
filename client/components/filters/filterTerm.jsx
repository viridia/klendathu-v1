import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import CloseIcon from 'icons/ic_close_black_24px.svg';
import { updateFilterTerm } from '../../store/filter';
import EditOperand, { defaultValueForType } from './editOperand.jsx';
import FIELD_TYPES from './fieldTypes';

const STRING_PREDICATES = new Immutable.OrderedMap({
  IN: 'contains',
  EQUALS: 'is exactly',
  NOT_IN: 'does not contain',
  NOT_EQUALS: 'is not exactly',
  STARTS_WITH: 'starts with',
  ENDS_WITH: 'ends with',
  // REGEX: 'matches regex',
  // NOT_REGEX: 'does not match regex',
});

/** Class which edits a single term of a filter expression. */
class FilterTerm extends React.Component {
  constructor() {
    super();
    this.onSelectField = this.onSelectField.bind(this);
    this.onSelectPredicate = this.onSelectPredicate.bind(this);
    this.onChangeValue = this.onChangeValue.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  onSelectField(field) {
    const { index, term, project } = this.props;
    const newTerm = FIELD_TYPES.get(field);
    if (!term || newTerm.type !== term.type) {
      this.props.onChange(index, {
        ...newTerm,
        field,
        value: defaultValueForType(project, newTerm.type),
      });
    } else {
      this.props.onChange(index, { ...term, field, value: term.value });
    }
  }

  onSelectPredicate(pred) {
    const { index, term } = this.props;
    this.props.onChange(index, { ...term, predicate: pred });
  }

  onChangeValue(value) {
    const { index, term } = this.props;
    this.props.onChange(index, { ...term, value });
  }

  onRemove(e) {
    e.preventDefault();
    this.props.onRemove(this.props.index);
  }

  renderPredicateSelector(preds, defaultPred) {
    const selected = (this.props.term && this.props.term.predicate) || defaultPred;
    return (
      <DropdownButton
          bsSize="small"
          title={preds.get(selected)}
          id="term-field"
          onSelect={this.onSelectPredicate}>
        {preds.map((caption, p) => <MenuItem eventKey={p} key={p}>{caption}</MenuItem>).toArray()}
      </DropdownButton>
    );
  }

  renderOpSelector(fieldInfo) {
    if (!fieldInfo) {
      return null;
    }
    switch (fieldInfo.type) {
      case 'searchText':
        return this.renderPredicateSelector(STRING_PREDICATES, 'IN');
      default:
        return null;
    }
  }

  render() {
    const { index, term, termTypes, project, children } = this.props;
    const items = [];
    FIELD_TYPES.forEach((ft, id) => {
      items.push(
        <MenuItem eventKey={id} key={id} disabled={termTypes.has(id)}>{ft.caption}</MenuItem>);
    });
    const caption = (term && term.caption) || 'Search by...';

    return (<section className="filter-term">
      <DropdownButton
          bsSize="small"
          title={caption}
          id="term-field"
          onSelect={this.onSelectField}>
        {items}
      </DropdownButton>
      {this.renderOpSelector(term)}
      <section className="filter-value">
        {term && (<EditOperand
            type={term.type}
            value={term.value}
            project={project}
            onChange={this.onChangeValue} />)}
      </section>
      {children}
      {index !== undefined &&
        <button className="remove" onClick={this.onRemove}><CloseIcon /></button>}
    </section>);
  }
}

FilterTerm.propTypes = {
  term: PropTypes.shape({
    field: PropTypes.string.isRequired,
    value: PropTypes.any,
    predicate: PropTypes.string,
  }),
  termTypes: ImmutablePropTypes.set.isRequired,
  index: PropTypes.number,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    template: PropTypes.shape({
      types: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    workflow: PropTypes.shape({
      states: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  children: PropTypes.node,
  updateFilterTerm: PropTypes.func.isRequired,
};

export default connect(
  (state, ownProps) => ({
    term: ownProps.index !== undefined ? state.filter.terms.get(ownProps.index) : null,
    termTypes: new Immutable.Set(state.filter.terms.map(t => t.field)),
  }),
  dispatch => bindActionCreators({ updateFilterTerm }, dispatch),
)(FilterTerm);
