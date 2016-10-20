import React, { PropTypes } from 'react';
import { toastr } from 'react-redux-toastr';
import IssueCompose from './issueCompose.jsx';
import { createIssue } from '../../store/issue';

export default class IssueCreate extends React.Component {
  constructor() {
    super();
    this.onSave = this.onSave.bind(this);
  }

  onSave(issue) {
    return createIssue(this.props.project.id, issue).then(resp => {
      toastr.success(`Issue #${resp.data.newIssue.id} created.`);
    });
  }

  render() {
    return (<IssueCompose
        {...this.props}
        issue={null}
        onSave={this.onSave} />);
  }
}

IssueCreate.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};
