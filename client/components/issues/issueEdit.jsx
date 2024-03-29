import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { graphql } from 'react-apollo';
import { toastr } from 'react-redux-toastr';
import IssueCompose from './issueCompose.jsx';
import IssueQuery from '../../graphql/queries/issue.graphql';
import { IssueContent } from '../../store/fragments';
import { updateIssue } from '../../store/issue';

class IssueEdit extends React.Component {
  constructor() {
    super();
    this.onSave = this.onSave.bind(this);
  }

  onSave(issueId, issue) {
    return updateIssue(this.props.project.id, issueId, issue).then(resp => {
      toastr.success(`Issue #${resp.data.updateIssue.id} updated.`);
      browserHistory.goBack();
    });
  }

  render() {
    return (this.props.data.issue ? <IssueCompose
        {...this.props}
        issue={this.props.data.issue}
        onSave={this.onSave} /> : null);
  }
}

IssueEdit.propTypes = {
  data: PropTypes.shape({
    issue: PropTypes.shape({}),
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

export default graphql(IssueQuery, {
  options: ({ project, params }) => ({
    variables: { project: project.id, id: parseInt(params.id, 10) },
    fragments: [IssueContent],
  }),
})(IssueEdit);
