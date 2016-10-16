import React, { PropTypes } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { LinkContainer } from 'react-router-bootstrap';
import ArrowBackIcon from 'icons/ic_arrow_back_black_24px.svg';
import ArrowForwardIcon from 'icons/ic_arrow_forward_black_24px.svg';
import ArrowUpIcon from 'icons/ic_arrow_upward_black_24px.svg';
import ErrorDisplay from '../debug/errorDisplay.jsx';
import UserName from '../common/userName.jsx';
import './issueDetails.scss';

class IssueDetails extends React.Component {
  renderTemplateFields() {
    return null;
  }

  render() {
    const { location } = this.props;
    const { issue, error } = this.props.data;
    if (error) {
      return <ErrorDisplay error={error} />;
    }
    if (!issue) {
      return <section className="kdt issue-details" />;
    }
    const backLink = (location.state && location.state.back) || { pathname: '..' };
    return (<section className="kdt issue-details">
      <section className="card">
        <header>
          <LinkContainer to={backLink}>
            <Button title="Back to issue list"><ArrowUpIcon /></Button>
          </LinkContainer>
          <div className="issue-id">Issue #{issue.id}: </div>
          <div className="issue-summary">{issue.summary}</div>
          <div className="issue-type">{issue.type}</div>
          <div className="divider" />
          <ButtonGroup>
            <Button title="Previous issue"><ArrowBackIcon /></Button>
            <Button title="Next issue" disabled><ArrowForwardIcon /></Button>
          </ButtonGroup>
        </header>
        <table className="create-issue-table form-table">
          <tbody>
            <tr>
              <th className="header">Description:</th>
              <td>{issue.description}</td>
            </tr>
            <tr>
              <th className="header">Reporter:</th>
              <td className="reporter">
                {issue.reporter
                  ? <UserName user={issue.reporter} />
                  : <span className="unassigned">unassigned</span>}
              </td>
            </tr>
            <tr>
              <th className="header">Owner:</th>
              <td>
                {issue.owner
                  ? <UserName user={issue.owner} />
                  : <span className="unassigned">unassigned</span>}
              </td>
            </tr>
            <tr>
              <th className="header">CC:</th>
              <td>{issue.cc}
              </td>
            </tr>
            {this.renderTemplateFields()}
            <tr>
              <th className="header">Labels:</th>
              <td>
                {issue.labels}
              </td>
            </tr>
            <tr>
              <th className="header">Keywords:</th>
              <td>{issue.keywords}</td>
            </tr>
            <tr>
              <th className="header">Attachments:</th>
              <td>
                <div className="upload">
                  Drop files here to upload (or click)
                </div>
              </td>
            </tr>
            <tr>
              <th className="header">Linked Issues:</th>
              <td>
                <div className="linked-group">
                  Links
                </div>
              </td>
            </tr>
            <tr>
              <th className="header">Comments:</th>
              <td>Comments
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>);
  }
}

IssueDetails.propTypes = {
  data: PropTypes.shape({
    error: PropTypes.shape({}),
    issue: PropTypes.shape({
      id: PropTypes.number.isRequired,
    }),
    loading: PropTypes.bool,
  }),
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

const IssueQuery = gql`query IssueQuery($project: ID!, $id: Int!) {
  issue(project: $project, id: $id) {
    id
    project
    type
    state
    summary
    description
    reporter
    owner
    cc
    created
    updated
    labels
    custom {
      name
      value
    }
  }
}`;

export default graphql(IssueQuery, {
  options: ({ project, params }) => ({
    variables: { project: project.id, id: parseInt(params.id, 10) },
  }),
})(IssueDetails);
