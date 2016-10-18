import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import FormControl from 'react-bootstrap/lib/FormControl';
import DiscloseButton from '../common/discloseButton.jsx';
import FilterTerm from './filterTerm.jsx';
import './filterParams.scss';

export default class FilterParams extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onChangeExpanded = this.onChangeExpanded.bind(this);
    this.onChangeTerm = this.onChangeTerm.bind(this);
    this.onRemoveTerm = this.onRemoveTerm.bind(this);
    this.state = {
      search: '',
      expanded: false,
      terms: Immutable.List.of(), // TODO: Derive from location params
    };
  }

  onChangeSearch(e) {
    this.setState({ search: e.target.value });
  }

  onChangeExpanded() {
    this.setState({ expanded: !this.state.expanded });
  }

  onChangeTerm(index, term) {
    if (index !== undefined) {
      this.setState({ terms: this.state.terms.set(index, term) });
    } else {
      this.setState({ terms: this.state.terms.push(term) });
    }
  }

  onRemoveTerm(index) {
    this.setState({ terms: this.state.terms.remove(index) });
  }

  renderFilterInputs() {
    if (!this.state.expanded) {
      return null;
    }
    return (
      <section className="term-list">
        {this.state.terms.map((term, index) => (
          <FilterTerm
              index={index}
              key={index}
              term={term}
              onRemove={this.onRemoveTerm}
              onChange={this.onChangeTerm} />))}
        <FilterTerm onRemove={this.onRemoveTerm} onChange={this.onChangeTerm} />
      </section>
    );
  }

  render() {
    return (
      <section className="card filter-params">
        <header className="filters">
          <DiscloseButton checked={this.state.expanded} onClick={this.onChangeExpanded} />
          Filters
          <div className="separator" />
          <FormControl
              className="search"
              placeholder="Search"
              value={this.state.search}
              onChange={this.onChangeSearch} />
        </header>
        {this.renderFilterInputs()}
      </section>);
  }
}

FilterParams.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    template: PropTypes.shape({
      types: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  params: PropTypes.shape({
    label: PropTypes.string,
  }).isRequired,
};
