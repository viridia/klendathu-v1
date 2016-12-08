import React, { PropTypes } from 'react';
import { graphql } from 'react-apollo';
import IssueQuery from '../../graphql/queries/issue.graphql';
import { IssueContent } from '../../store/fragments';
import './labelName.scss';

/** Component that displays an issue as a single-line summary. */
class IssueSummary extends React.Component {
  render() {
    const issue = this.props.data.issue;
    if (issue) {
      return (<span className="issue">
        <span className="id">#{issue.id}</span>
        <span className="summary">: {issue.summary}</span>
      </span>);
    } else {
      return (<span className="issue">
        <span className="id">#{this.props.id}</span>
        <span className="summary unknown">: unknown issue</span>
      </span>);
    }
  }
}

IssueSummary.propTypes = {
  id: React.PropTypes.number.isRequired,
  project: React.PropTypes.string.isRequired,
  data: PropTypes.shape({
    issue: PropTypes.shape({}),
  }),
};

export default graphql(IssueQuery, {
  options: ({ id, project }) => ({
    variables: { id, project },
    fragments: [IssueContent],
  }),
})(IssueSummary);
