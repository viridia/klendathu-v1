import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import Immutable from 'immutable';
import Button from 'react-bootstrap/lib/Button';
import Collapse from 'react-bootstrap/lib/Collapse';
import FormControl from 'react-bootstrap/lib/FormControl';
import CloseIcon from 'icons/ic_close_black_24px.svg';
import DiscloseButton from '../common/discloseButton.jsx';
import FilterTerm from './filterTerm.jsx';
import './filterParams.scss';

export default class FilterParams extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onClearSearch = this.onClearSearch.bind(this);
    this.onChangeExpanded = this.onChangeExpanded.bind(this);
    this.onChangeTerm = this.onChangeTerm.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onRemoveTerm = this.onRemoveTerm.bind(this);
    this.state = {
      search: props.location.query.search || '',
      expanded: false,
      terms: Immutable.List.of(), // TODO: Derive from location params
    };
  }

  onChangeSearch(e) {
    this.setState({ search: e.target.value });
  }

  onClearSearch(e) {
    e.preventDefault();
    this.setState({ search: '' });
    browserHistory.push({ ...this.props.location, query: { search: undefined } });
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

  onKeyDown(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      if (this.state.search.length > 0) {
        browserHistory.push({ ...this.props.location, query: { search: this.state.search } });
      } else {
        browserHistory.push({ ...this.props.location, query: { search: undefined } });
      }
    }
  }

  renderFilterTerms() {
    return (
      <Collapse className="term-list" in={this.state.expanded}>
        <section className="term-list">
          {this.state.terms.map((term, index) => (
            <FilterTerm
                index={index}
                key={index}
                term={term}
                project={this.props.project}
                onRemove={this.onRemoveTerm}
                onChange={this.onChangeTerm} />))}
          <FilterTerm
              project={this.props.project}
              onRemove={this.onRemoveTerm}
              onChange={this.onChangeTerm} />
        </section>
      </Collapse>
    );
  }

  render() {
    return (
      <section className="card filter-params">
        <header className="filters">
          <DiscloseButton checked={this.state.expanded} onClick={this.onChangeExpanded} />
          Filters
          <div className="separator" />
          <div className="search-group">
            <FormControl
                className="search"
                placeholder="Search"
                value={this.state.search}
                onChange={this.onChangeSearch}
                onKeyDown={this.onKeyDown} />
            <Button className="clear" onClick={this.onClearSearch}><CloseIcon /></Button>
          </div>
        </header>
        {this.renderFilterTerms()}
      </section>);
  }
}

FilterParams.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    template: PropTypes.shape({
      types: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    workflow: PropTypes.shape({
      states: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    query: PropTypes.shape({
      search: PropTypes.string,
    }).isRequired,
  }).isRequired,
  params: PropTypes.shape({
    label: PropTypes.string,
  }).isRequired,
};
