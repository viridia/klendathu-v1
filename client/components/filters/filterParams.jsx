import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Button from 'react-bootstrap/lib/Button';
import Collapse from 'react-bootstrap/lib/Collapse';
import FormControl from 'react-bootstrap/lib/FormControl';
import CloseIcon from 'icons/ic_close_black_24px.svg';
import DiscloseButton from '../common/discloseButton.jsx';
import FilterTerm from './filterTerm.jsx';
import SaveFilterDialog from './saveFilterDialog.jsx';
import { showFilters, addFilterTerm, updateFilterTerm, removeFilterTerm, setFilterTerms }
  from '../../store/filter';
import './filterParams.scss';

class FilterParams extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onClearSearch = this.onClearSearch.bind(this);
    this.onChangeExpanded = this.onChangeExpanded.bind(this);
    this.onChangeTerm = this.onChangeTerm.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onRemoveTerm = this.onRemoveTerm.bind(this);
    this.onApplyFilter = this.onApplyFilter.bind(this);
    this.onSaveFilter = this.onSaveFilter.bind(this);
    this.onClearFilter = this.onClearFilter.bind(this);
    this.onCloseSaveDialog = this.onCloseSaveDialog.bind(this);
    this.state = {
      search: props.search || '',
      showSaveDialog: false,
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
    this.props.showFilters(!this.props.visible);
  }

  onChangeTerm(index, term) {
    if (index !== undefined) {
      this.props.updateFilterTerm([index, term]);
    } else {
      this.props.addFilterTerm(term);
    }
  }

  onRemoveTerm(index) {
    this.props.removeFilterTerm(index);
  }

  onKeyDown(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      if (this.state.search.length > 0) {
        browserHistory.push({ ...this.props.location, query: { search: this.state.search } });
      } else {
        browserHistory.push({ ...this.props.location });
      }
    }
  }

  onApplyFilter(e) {
    e.preventDefault();
    const query = {};
    this.props.terms.forEach(term => {
      term.buildQuery(query, term);
    });
    browserHistory.push({ ...this.props.location, query });
  }

  onSaveFilter(e) {
    e.preventDefault();
    this.setState({ showSaveDialog: true });
  }

  onCloseSaveDialog() {
    this.setState({ showSaveDialog: false });
  }

  onClearFilter(e) {
    e.preventDefault();
    this.setState({ terms: Immutable.List.of() });
    browserHistory.push({ ...this.props.location, query: {} });
  }

  renderFilterTerms() {
    return (
      <Collapse className="term-list" in={this.props.visible}>
        <section className="term-list">
          {this.props.terms.map((term, index) => (
            <FilterTerm
                index={index}
                key={index}
                project={this.props.project}
                onRemove={this.onRemoveTerm}
                onChange={this.onChangeTerm} />))}
          <FilterTerm
              project={this.props.project}
              onRemove={this.onRemoveTerm}
              onChange={this.onChangeTerm}>
            <Button
                bsStyle="default"
                bsSize="small"
                onClick={this.onClearFilter}
                disabled={this.props.terms.size === 0}>Clear</Button>
            <Button
                bsStyle="default"
                bsSize="small"
                onClick={this.onSaveFilter}
                disabled={this.props.terms.size === 0}>Save Filter As...</Button>
            <Button
                bsStyle="primary"
                bsSize="small"
                onClick={this.onApplyFilter}
                disabled={this.props.terms.size === 0}>Apply Filter</Button>
          </FilterTerm>
          {this.state.showSaveDialog && <SaveFilterDialog onHide={this.onCloseSaveDialog} />}
        </section>
      </Collapse>
    );
  }

  render() {
    return (
      <section className="card filter-params">
        <header className="filters">
          <DiscloseButton checked={this.props.visible} onClick={this.onChangeExpanded} />
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
  location: PropTypes.shape({}).isRequired,
  search: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  terms: ImmutablePropTypes.list.isRequired,
  showFilters: PropTypes.func.isRequired,
  addFilterTerm: PropTypes.func.isRequired,
  updateFilterTerm: PropTypes.func.isRequired,
  removeFilterTerm: PropTypes.func.isRequired,
  setFilterTerms: PropTypes.func.isRequired,
};

export default connect(
  (state) => ({
    terms: state.filter.terms,
    visible: state.filter.visible,
  }),
  dispatch => bindActionCreators({
    showFilters, addFilterTerm, updateFilterTerm, removeFilterTerm, setFilterTerms,
  }, dispatch),
)(FilterParams);
