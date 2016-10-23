import React, { PropTypes } from 'react';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import { Link } from 'react-router';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import classNames from 'classnames';
import LabelName from '../common/labelName.jsx';
import ErrorDisplay from '../debug/errorDisplay.jsx';
import FilterParams from './filterParams.jsx';
import './issueList.scss';
import './../common/card.scss';

class ColumnRenderer {
  constructor(field) {
    this.field = field;
  }

  get title() {
    return this.field.caption;
  }

  get center() {
    return this.field.align === 'center';
  }

  render(issue) {
    for (const customField of issue.custom) {
      if (customField.name === this.field.id) {
        return customField.value;
      }
    }
    return '';
  }
}

class IssueList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: ['priority', 'severity'],
      search: '',
    };
    this.buildColumns(props.project);
    this.buildIssueIdList(props);
  }

  componentWillReceiveProps(nextProps) {
    this.buildColumns(nextProps.project);
    this.buildIssueIdList(nextProps);
  }

  onChangeSearch(e) {
    this.setState({ search: e.target.value });
  }

  buildColumns(project) {
    this.columnRenderers = {};
    if (project) {
      for (const type of this.props.project.template.types) {
        if (type.fields) {
          for (const field of type.fields) {
            this.columnRenderers[`custom.${field.id}`] = new ColumnRenderer(field);
          }
        }
      }
    }
  }

  buildIssueIdList(props) {
    const { issues } = props.data;
    if (!issues) {
      this.issueIds = [];
    } else {
      this.issueIds = issues.map(i => i.id);
    }
  }

  renderHeader() {
    return (
      <thead>
        <tr className="heading">
          <th className="selected"><Checkbox bsClass="cbox" /></th>
          <th className="id">#</th>
          <th className="type">Type</th>
          <th className="owner">Owner</th>
          <th className="state">State</th>
          {this.state.columns.map(cname => {
            const cr = this.columnRenderers[`custom.${cname}`];
            if (cr) {
              return (<th
                  className={classNames('custom', { center: cr.center })}
                  key={cname}>
                {cr.title}
              </th>);
            }
            return <th className="custom cener" key={cname}>--</th>;
          })}
          <th className="summary">Summary</th>
        </tr>
      </thead>
    );
  }

  renderIssue(issue) {
    const project = this.props.project;
    const linkTarget = {
      pathname: `/project/${project.name}/issues/${issue.id}`,
      state: {
        back: this.props.location,
        idList: this.issueIds,
      },
    };
    return (
      <tr key={issue.id}>
        <td className="selected"><Checkbox bsClass="cbox" /></td>
        <td className="id">
          <Link to={linkTarget}>{issue.id}</Link>
        </td>
        <td className="type">
          <Link to={linkTarget}>{issue.type}</Link>
        </td>
        <td className="owner">
          <div className="pad">
            {issue.owner || <div className="unassigned">unassigned</div>}
          </div>
        </td>
        <td className="state">
          <Link to={linkTarget}>{issue.state}</Link>
        </td>
        {this.state.columns.map(cname => {
          const cr = this.columnRenderers[`custom.${cname}`];
          if (cr) {
            return (<td
                className={classNames('custom', { center: cr.center })}
                key={cname}>
              <div className="pad">{cr.render(issue)}</div>
            </td>);
          }
          return <td className="custom" key={cname} />;
        })}
        <td className="title">
          <Link to={linkTarget}>
            <span className="summary">{issue.summary}</span>
            {issue.labels.map(l => <LabelName project={project.id} label={l} key={l} />)}
          </Link>
        </td>
      </tr>);
  }

  renderIssueList() {
    const { issues, loading, error } = this.props.data;
    if (error) {
      return <ErrorDisplay error={error} />;
    }
    if (loading) {
      return null;
    }

    if (!issues || issues.length === 0) {
      return (
        <div className="card report">
          <div className="no-issues">No issues found</div>
        </div>
      );
    }

    // console.log(JSON.stringify(issues, null, 2));
    return (
      <div className="card report">
        <table className="issue">
          {this.renderHeader()}
          <tbody>
            {issues.map(i => this.renderIssue(i))}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    return (<section className="kdt issue-list">
      <FilterParams {...this.props} />
      {this.renderIssueList()}
    </section>);
  }
}

// linked: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
// custom: new GraphQLList(new GraphQLNonNull(customSearch)),
const IssueListQuery = gql`query IssueListQuery(
    $project: ID!,
    $search: String,
    $type: [String!],
    $state: [String!],
    $summary: String,
    $summaryPred: PREDICATE,
    $description: String,
    $descriptionPred: PREDICATE,
    $owner: [ID!],
    $reporter: [ID!],
    $cc: [ID!],
    $labels: [Int!],
    $comment: String,
    $commentPred: PREDICATE,
    $sort: [String!]) {
  issues(
      project: $project,
      search: $search,
      type: $type,
      state: $state,
      summary: $summary,
      summaryPred: $summaryPred,
      description: $description,
      descriptionPred: $descriptionPred,
      owner: $owner,
      reporter: $reporter,
      cc: $cc,
      labels: $labels,
      comment: $comment,
      commentPred: $commentPred,
      sort: $sort) {
    id
    project
    type
    state
    summary
    description
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

IssueList.propTypes = {
  data: PropTypes.shape({
    error: PropTypes.shape({}),
    loading: PropTypes.bool,
    issues: PropTypes.arrayOf(PropTypes.shape({})),
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
      description: PropTypes.string,
      labels: PropTypes.string,
    }),
  }).isRequired,
  params: PropTypes.shape({
    project: PropTypes.string,
  }).isRequired,
};

export default graphql(IssueListQuery, {
  options: ({ project, location: { query } }) => {
    const { type, state, summary, description, label } = query || {};
    return {
      variables: {
        project: project.id,
        search: undefined,
        type: type && type.split(','),
        state: state && state.split(','),
        summary,
        summaryPred: undefined,
        description,
        descriptionPred: undefined,
        reporter: undefined,
        owner: undefined,
        cc: undefined,
        labels: label && label.split(','),
        comment: undefined,
        commentPred: undefined,
        sort: ['-updated'],
      },
    };
  },
})(IssueList);
