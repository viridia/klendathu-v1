import React, { PropTypes } from 'react';
import { graphql } from 'react-apollo';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { LinkContainer } from 'react-router-bootstrap';
import ArrowBackIcon from 'icons/ic_arrow_back_black_24px.svg';
import ArrowForwardIcon from 'icons/ic_arrow_forward_black_24px.svg';
import ArrowUpIcon from 'icons/ic_arrow_upward_black_24px.svg';
import ErrorDisplay from '../debug/errorDisplay.jsx';
import UserName from '../common/userName.jsx';
import LabelName from '../common/labelName.jsx';
import RelativeDate from '../common/relativeDate.jsx';
import IssueChanges from './issueChanges.jsx';
import CommentEdit from './commentEdit.jsx';
import { Role } from '../../lib/role';
import IssueDetailsQuery from '../../graphql/queries/issueDetails.graphql';
import { IssueContent } from '../../store/fragments';
import { addComment } from '../../store/issue';
import './issueDetails.scss';

class IssueDetails extends React.Component {
  constructor(props) {
    super(props);
    this.onAddComment = this.onAddComment.bind(this);
    this.state = this.navState(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.navState(nextProps));
  }

  onAddComment(newComment) {
    const { project, data: { issue } } = this.props;
    return addComment(project.id, issue.id, newComment).then(() => {
      this.props.data.refetch();
    });
  }

  navState(props) {
    const { location: { state }, data: { issue } } = props;
    let prevIssue = null;
    let nextIssue = null;
    if (issue && state.idList && state.idList.length > 0) {
      const index = Math.max(0, state.idList.indexOf(issue.id));
      if (index > 0) {
        prevIssue = state.idList[index - 1];
      }
      if (index < state.idList.length - 1) {
        nextIssue = state.idList[index + 1];
      }
    }
    return { prevIssue, nextIssue };
  }

  renderTemplateFields() {
    return null;
  }

  renderChange(change, index) {
    const { project } = this.props;
    return (<section className="change-entry" key={index}>
      <ul className="field-change-list">
        {change.type && (<li className="field-change">
            type: {change.type.before} to {change.type.after}
          </li>)}
        {change.state &&
          <li className="field-change">state: {change.state.before} to {change.state.after}</li>}
        {change.summary && (<li className="field-change">
          summary: {change.summary.before} to {change.summary.after}
        </li>)}
        {change.owner &&
          <li className="field-change">owner: {change.owner.before} to {change.owner.after}</li>}
        {change.cc && change.cc.added && change.cc.added.map(cc =>
          (<li className="field-change" key={cc}>added <UserName user={cc} full /> to cc</li>))}
        {change.cc && change.cc.removed && change.cc.removed.map(cc =>
          (<li className="field-change" key={cc}>removed <UserName user={cc} full /> from cc</li>))}
        {change.labels && change.labels.added && change.labels.added.map(l =>
          (<li className="field-change" key={l}>
            added label <LabelName label={l} project={project.id} key={l} />
          </li>))}
        {change.labels && change.labels.removed && change.labels.removed.map(l =>
          (<li className="field-change" key={l}>
            removed label <LabelName label={l} project={project.id} key={l} />
          </li>))}
      </ul>
    </section>);
  }

  renderChangeLog() {
    const { issue } = this.props.data;
    if (!issue.changes) {
      return null;
    }
    return (
      <div>
        {issue.changes.map((ch, index) => this.renderChange(ch, index))}
      </div>
    );
  }

  render() {
    const { location, project } = this.props;
    const { issue, error } = this.props.data;
    const { prevIssue, nextIssue } = this.state;
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
            <Button title="Back to issue list" className="issue-up"><ArrowUpIcon /></Button>
          </LinkContainer>
          <section className="title">
            <div className="issue-id">Issue #{issue.id}: </div>
            <div className="issue-summary">{issue.summary}</div>
          </section>
          <div className="issue-type">{issue.type}</div>
          <div className="divider" />
          <ButtonGroup className="issue-actions">
            <LinkContainer
                to={{
                  pathname: `/project/${project.name}/edit/${issue.id}`,
                  state: { ...location.state, back: this.props.location },
                }}>
              <Button title="Edit issue" disabled={project.role < Role.UPDATER}>Edit</Button>
            </LinkContainer>
            <Button
                title="Delete issue" bsStyle="default"
                disabled={project.role < Role.MANAGER}>Delete</Button>
          </ButtonGroup>
          <ButtonGroup className="issue-nav">
            <LinkContainer
                to={{ ...location, pathname: `/project/${project.name}/issues/${prevIssue}` }}
                disabled={prevIssue === null}>
              <Button title="Previous issue">
                <ArrowBackIcon />
              </Button>
            </LinkContainer>
            <LinkContainer
                to={{ ...location, pathname: `/project/${project.name}/issues/${nextIssue}` }}
                disabled={nextIssue === null}>
              <Button title="Next issue">
                <ArrowForwardIcon />
              </Button>
            </LinkContainer>
          </ButtonGroup>
        </header>
        <section className="content">
          <table className="create-issue-table form-table">
            <tbody>
              {issue.description.length > 0 && (
                <tr>
                  <th className="header">Description:</th>
                  <td>{issue.description}</td>
                </tr>
              )}
              <tr>
                <th className="header">Created:</th>
                <td className="changes">
                  <RelativeDate date={new Date(issue.created)} />
                </td>
              </tr>
              <tr>
                <th className="header">Reporter:</th>
                <td className="reporter">
                  {issue.reporter
                    ? <UserName user={issue.reporter} full />
                    : <span className="unassigned">unassigned</span>}
                </td>
              </tr>
              <tr>
                <th className="header">Owner:</th>
                <td>
                  {issue.owner
                    ? <UserName user={issue.owner} full />
                    : <span className="unassigned">unassigned</span>}
                </td>
              </tr>
              {issue.cc.length > 0 && (
                <tr>
                  <th className="header">CC:</th>
                  <td>{issue.cc.map(cc => <UserName user={cc} key={cc} full />)}
                  </td>
                </tr>
              )}
              {this.renderTemplateFields()}
              {issue.labels.length > 0 && (
                <tr>
                  <th className="header">Labels:</th>
                  <td>
                    {issue.labels.map(label =>
                      <LabelName label={label} project={project.id} key={label} />)}
                  </td>
                </tr>
              )}
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
                <th className="header">Issue History:</th>
                <td>
                  <IssueChanges
                      issue={issue} comments={issue.comments} changes={issue.changes}
                      project={project} onAddComment={this.onAddComment} />
                </td>
              </tr>
              <tr>
                <th className="header" />
                <td>
                  <CommentEdit
                      issue={issue} comments={issue.comments}
                      project={project} onAddComment={this.onAddComment} />
                </td>
              </tr>
            </tbody>
          </table>
        </section>
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
    refetch: PropTypes.func.isRequired,
  }),
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    role: PropTypes.number.isRequired,
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    state: PropTypes.shape({
      idList: PropTypes.arrayOf(PropTypes.number),
    }),
  }).isRequired,
};

export default graphql(IssueDetailsQuery, {
  options: ({ project, params }) => ({
    variables: { project: project.id, id: parseInt(params.id, 10) },
    fragments: [IssueContent],
  }),
})(IssueDetails);
