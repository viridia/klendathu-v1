import React, { PropTypes } from 'react';
import { graphql } from 'react-apollo';
import marked from 'marked';
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
import LinkedIssues from './linkedIssues.jsx';
import { IssueContent } from '../../store/fragments';
import { addComment } from '../../store/issue';
import './issueDetails.scss';

// Global options for marked.
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: true,
});

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

  /** Compute the next and previous issue id given the list of issue ids passed in. */
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

  // TODO: combine this with the one in issueCompose?
  customFieldList(issueType) {
    let fields = [];
    const { project } = this.props;
    if (issueType.extends && issueType.extends.startsWith('./')) {
      const parentType = project.template.typesById.get(issueType.extends.slice(2));
      if (parentType) {
        fields = this.customFieldList(parentType);
      }
    }
    if (issueType.fields) {
      fields = fields.concat(issueType.fields);
    }
    return fields;
  }

  renderTemplateFields(issueType, custom) {
    const result = [];
    const fields = this.customFieldList(issueType);
    const customMap = new Map(custom.map(field => [field.name, field.value]));
    for (const field of fields) {
      const value = customMap.get(field.id);
      if (value) {
        switch (field.type) {
          case 'TEXT':
            result.push(<tr key={field.id}>
              <th>{field.caption}:</th>
              <td>{value}</td>
            </tr>);
            break;
          case 'ENUM':
            result.push(<tr key={field.id}>
              <th>{field.caption}:</th>
              <td>{value}</td>
            </tr>);
            break;
          default:
            console.error('invalid field type:', field.type);
            break;
        }
      }
    }
    return result;
  }

  renderDescription(description) {
    return <td className="descr" dangerouslySetInnerHTML={{ __html: marked(description) }} />; // eslint-disable-line
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
    const { labels = [], comments = [], changes = [], linked = [], custom = [] } = issue;
    const issueType = project.template.typesById.get(issue.type);
    const backLink = (location.state && location.state.back) || { pathname: '..' };
    return (<section className="kdt issue-details">
      <section className="card">
        <header>
          <LinkContainer to={backLink}>
            <Button title="Back to issue list" className="issue-up"><ArrowUpIcon /></Button>
          </LinkContainer>
          <div className="issue-id">Issue #{issue.id}: </div>
          <div className="summary">{issue.summary}</div>
          <div className="stretch">
            <div className="issue-type">{issue.type}</div>
          </div>
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
              {issue.summary.length > 0 && (
                <tr>
                  <th className="header">Summary:</th>
                  <td>{issue.summary}</td>
                </tr>
              )}
              {issue.description.length > 0 && (
                <tr>
                  <th className="header">Description:</th>
                  {this.renderDescription(issue.description)}
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
              {this.renderTemplateFields(issueType, custom)}
              {labels.length > 0 && (
                <tr>
                  <th className="header labels">Labels:</th>
                  <td>
                    {labels.map(label =>
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
              {linked.length > 0 && <tr>
                <th className="header linked">Linked Issues:</th>
                <td>
                  <LinkedIssues
                      project={project}
                      links={linked}
                      onRemoveLink={this.onRemoveLinkedIssue} />
                </td>
              </tr>}
              {(comments || changes) && <tr>
                <th className="header history">Issue History:</th>
                <td>
                  <IssueChanges
                      issue={issue} comments={comments} changes={changes}
                      project={project} onAddComment={this.onAddComment} />
                </td>
              </tr>}
              <tr>
                <th className="header" />
                <td>
                  <CommentEdit issue={issue} project={project} onAddComment={this.onAddComment} />
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
