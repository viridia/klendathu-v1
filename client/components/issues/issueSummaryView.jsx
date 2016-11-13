import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import Immutable from 'immutable';
import { graphql, withApollo } from 'react-apollo';
import ApolloClient from 'apollo-client';
import equal from 'deep-equal';
import ErrorDisplay from '../debug/errorDisplay.jsx';
import FilterParams from '../filters/filterParams.jsx';
import MassEdit from '../filters/massEdit.jsx';
import IssueList from './issueList.jsx';
import IssueListQuery from '../../graphql/queries/issueList.graphql';
import { setFilterTerms } from '../../store/filter';
import FIELD_TYPES from '../filters/fieldTypes';

class IssueSummaryView extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.query = new Immutable.Map(props.location.query || {});
    this.hotlist = this.hotlistSet(props);
  }

  componentWillMount() {
    this.parseQuery();
  }

  componentWillReceiveProps(nextProps) {
    const query = new Immutable.Map(nextProps.location.query || {});
    if (!Immutable.is(this.query, query)) {
      this.query = query;
      this.parseQuery();
    }
    this.hotlist = this.hotlistSet(nextProps);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.data.issues !== nextProps.data.issues
        || this.props.data.loading !== nextProps.data.loading
        || this.props.project !== nextProps.project
        || !equal(this.props.data.error, nextProps.data.error)
        || !equal(this.props.location, nextProps.location);
  }

  parseQuery() {
    // What this code does is update the list of terms from the current query params, and does
    // it in a way that preserves the order of the query terms.
    const context = {
      client: this.props.client,
      project: this.props.project,
      profile: this.context.profile,
    };
    const filterTerms = [];
    for (const field of this.query.keys()) {
      const term = FIELD_TYPES.get(field);
      if (term) {
        const newTerm = { ...term.parseQuery(this.query, context), field };
        // console.log(field, newTerm);
        if (newTerm !== null) {
          filterTerms.push(Promise.resolve(newTerm));
        }
      }
    }
    Promise.all(filterTerms).then(terms => {
      this.props.setFilterTerms(new Immutable.List(terms));
    });
  }

  hotlistSet(props) {
    if (props.data && props.data.projectMembership) {
      const labels = props.data.projectMembership.labels || [];
      return new Immutable.Set(labels);
    }
    return Immutable.Set.of();
  }

  render() {
    if (this.props.data.error) {
      return <ErrorDisplay error={this.props.data.error} />;
    }
    const { issues } = this.props.data;
    return (<section className="kdt issue-list">
      <FilterParams {...this.props} query={this.query.get('search')} />
      <MassEdit {...this.props} issues={issues} />
      <IssueList
          {...this.props}
          issues={issues}
          labels={this.hotlist}
          loading={this.props.data.loading} />
    </section>);
  }
}

IssueSummaryView.propTypes = {
  data: PropTypes.shape({
    error: PropTypes.shape({}),
    loading: PropTypes.bool,
    issues: PropTypes.arrayOf(PropTypes.shape({})),
    projectMembership: PropTypes.shape({}),
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    template: PropTypes.shape({
      types: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    query: PropTypes.shape({
      type: PropTypes.string,
      state: PropTypes.string,
      summary: PropTypes.string,
      summaryPred: PropTypes.string,
      description: PropTypes.string,
      descriptionPred: PropTypes.string,
      labels: PropTypes.string,
      owner: PropTypes.string,
      reporter: PropTypes.string,
    }),
  }).isRequired,
  client: PropTypes.instanceOf(ApolloClient).isRequired,
  setFilterTerms: PropTypes.func.isRequired,
};

IssueSummaryView.contextTypes = {
  profile: PropTypes.shape({}),
};

function defaultStates(project) {
  // Default behavior is to show 'open' states.
  return project.workflow.states.filter(st => !st.closed).map(st => st.id);
}

export default compose(
  graphql(IssueListQuery, {
    options: ({ project, location: { query } }) => {
      const {
        type, state,
        summary, summaryPred,
        description, descriptionPred,
        label, search,
        owner, reporter,
        sort,
      } = query || {};
      return {
        variables: {
          project: project.id,
          search,
          type: type && type.split(','),
          state: (state && state !== 'open') ? state.split(',') : defaultStates(project),
          summary,
          summaryPred,
          description,
          descriptionPred,
          reporter,
          owner,
          cc: undefined,
          labels: label && label.split(','),
          comment: undefined,
          commentPred: undefined,
          sort: [sort || '-updated'],
        },
      };
    },
  }),
  connect(
    (state) => ({
      selection: state.issueSelection,
    }),
    dispatch => bindActionCreators({ setFilterTerms }, dispatch),
  ),
  withApollo,
)(IssueSummaryView);
