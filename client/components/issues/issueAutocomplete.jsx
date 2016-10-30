import React, { PropTypes } from 'react';
import { withApollo } from 'react-apollo';
import ApolloClient from 'apollo-client';
import AutocompleteChips from '../common/ac/autocompleteChips.jsx';
import IssueSearchQuery from '../../graphql/queries/issueSearch.graphql';
import '../common/ac/chip.scss';

class IssueAutoComplete extends React.Component {
  constructor(props) {
    super(props);
    this.onSearch = this.onSearch.bind(this);
    this.onRenderSuggestion = this.onRenderSuggestion.bind(this);
    this.onRenderSelection = this.onRenderSelection.bind(this);
    this.onGetValue = this.onGetValue.bind(this);
    this.onGetSortKey = this.onGetSortKey.bind(this);
  }

  onSearch(search, callback) {
    if (search.length < 1) {
      callback([]);
    } else {
      this.props.client.query({
        query: IssueSearchQuery,
        variables: { search, project: this.props.project.id },
      }).then(resp => {
        callback(resp.data.issueSearch.filter(issue => issue.id !== this.props.exclude));
      });
    }
  }

  onRenderSuggestion(issue) {
    return (<span className="issue-ref">
      <span className="id">#{issue.id}: </span>
      <span className="summary">{issue.summary}</span>
    </span>);
  }

  onRenderSelection(issue) {
    return this.onRenderSuggestion(issue);
  }

  onGetValue(issue) {
    return issue.id;
  }

  onGetSortKey(issue) {
    return -issue.score;
  }

  render() {
    return (
      <AutocompleteChips
          {...this.props}
          onSearch={this.onSearch}
          onGetValue={this.onGetValue}
          onGetSortKey={this.onGetSortKey}
          onRenderSuggestion={this.onRenderSuggestion}
          onRenderSelection={this.onRenderSelection} />
    );
  }
}

IssueAutoComplete.propTypes = {
  value: PropTypes.string,
  project: PropTypes.shape({
    id: PropTypes.string,
  }),
  onEnter: PropTypes.func,
  client: PropTypes.instanceOf(ApolloClient).isRequired,
  selection: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.any.isRequired),
    PropTypes.any,
  ]),
  exclude: PropTypes.number,
};

export default withApollo(IssueAutoComplete);
