import React, { PropTypes } from 'react';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import classNames from 'classnames';
import UserName from '../common/userName.jsx';
import './issues.scss';

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
    };
    this.buildColumns(props.project);
  }

  componentWillReceiveProps(nextProps) {
    this.buildColumns(nextProps.project);
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
          <th className="selected"><Checkbox /></th>
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
    return (
      <tr key={issue.id}>
        <td className="selected"><Checkbox /></td>
        <td className="id">{issue.id}</td>
        <td className="type">{issue.type}</td>
        <td className="owner"><UserName user={issue.owner} /></td>
        <td className="state">{issue.state}</td>
        {this.state.columns.map(cname => {
          const cr = this.columnRenderers[`custom.${cname}`];
          if (cr) {
            return (<td
                className={classNames('custom', { center: cr.center })}
                key={cname}>
              {cr.render(issue)}
            </td>);
          }
          return <td className="custom" key={cname} />;
        })}
        <td className="summary">
          {issue.summary}
          <span className="tag">release-blockers</span>
          <span className="tag">technical-debt</span>
        </td>
      </tr>);
  }

  renderIssueList() {
    const { issues, loading } = this.props.data;
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
      <div className="card">
        <div className="filters">
          <div className="kdt expander" />
          Filters
        </div>
      </div>
      {this.renderIssueList()}
    </section>);
  }
}

const IssueQuery = gql`query IssueQuery($project: ID!) {
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
    loading: PropTypes.bool,
    issues: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    template: PropTypes.shape({
      types: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  }).isRequired,
};

export default graphql(IssueQuery, {
  options: ({ project }) => ({ variables: { project: project.id } }),
})(IssueList);
