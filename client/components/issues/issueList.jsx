import React, { PropTypes } from 'react';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import { Link } from 'react-router';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import classNames from 'classnames';
import LabelName from '../common/labelName.jsx';
import UserName from '../common/userName.jsx';
import ErrorDisplay from '../debug/errorDisplay.jsx';
import FilterParams from './filterParams.jsx';
import './issueList.scss';

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
  }

  componentWillReceiveProps(nextProps) {
    this.buildColumns(nextProps.project);
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
      state: { back: this.props.location },
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
            {issue.owner
              ? <UserName user={issue.owner} />
            : <div className="unassigned">unassigned</div>}
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
            {issue.labels.map(l => <LabelName label={l} key={l} />)}
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
        <div className="card">
          <div className="no-issues">No issues found</div>
        </div>
      );
    }

    // console.log(JSON.stringify(issues, null, 2));
    return (
      <div className="card">
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

const IssueListQuery = gql`query IssueListQuery($project: ID!) {
  issues(project: $project) {
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
  }).isRequired,
  params: PropTypes.shape({
    label: PropTypes.string,
  }).isRequired,
};

export default graphql(IssueListQuery, {
  options: ({ project, params: { label } }) => ({ variables: {
    project: project.id,
    label,
  } }),
})(IssueList);
