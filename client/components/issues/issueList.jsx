import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import { Link, browserHistory } from 'react-router';
import classNames from 'classnames';
import LabelName from '../common/labelName.jsx';
import ColumnSort from '../common/columnSort.jsx';
import RelativeDate from '../common/relativeDate.jsx';
import { clearSelection, selectIssues, deselectIssues } from '../../store/issueSelection';

import './issueList.scss';
import './../common/card.scss';

class StdColumnRenderer {
  constructor(title, fieldName, className) {
    this.title = title;
    this.fieldName = fieldName;
    this.className = className;
  }

  renderHeader(sort, descending, onChangeSort) {
    return (
      <th className={this.className} key={this.fieldName}>
        <ColumnSort
            column={this.fieldName}
            sortKey={sort}
            descending={descending}
            onChangeSort={onChangeSort}>
          {this.title}
        </ColumnSort>
      </th>
    );
  }
}

class TextColumnRenderer extends StdColumnRenderer {
  render(issue) {
    return (
      <td className={this.className} key={this.fieldName}>
        {issue[this.fieldName]}
      </td>
    );
  }
}

class UserColumnRenderer extends StdColumnRenderer {
  render(issue) {
    return (
      <td className={this.className} key={this.fieldName}>
        {issue[this.fieldName] || <div className="unassigned">unassigned</div>}
      </td>
    );
  }
}

class DateColumnRenderer extends StdColumnRenderer {
  render(issue) {
    return (
      <td className={this.className} key={this.fieldName}>
        <RelativeDate date={new Date(issue[this.fieldName])} brief />
      </td>
    );
  }
}

class CustomColumnRenderer {
  constructor(field) {
    this.field = field;
    this.title = this.field.caption;
    this.className = classNames('custom pad', { center: this.center });
  }

  renderHeader(sort, descending, onChangeSort) {
    return (
      <th className={this.className} key={this.field.id}>
        <ColumnSort
            column={`custom.${this.field.id}`}
            sortKey={sort}
            descending={descending}
            onChangeSort={onChangeSort}>
          {this.title}
        </ColumnSort>
      </th>
    );
  }

  render(issue) {
    if (issue.custom) {
      for (const customField of issue.custom) {
        if (customField.name === this.field.id) {
          return (<td
              className={this.className}
              key={this.field.id}>
            {customField.value}
          </td>);
        }
      }
    }
    return <td className="custom" key={this.field.id} />;
  }
}

class IssueList extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeSelection = this.onChangeSelection.bind(this);
    this.onChangeSelectAll = this.onChangeSelectAll.bind(this);
    this.onChangeSort = this.onChangeSort.bind(this);
    this.state = {
      columns: ['updated', 'type', 'owner', 'state', 'custom.priority', 'custom.severity'],
    };
    this.buildColumns(props.project);
    this.buildIssueIdList(props);
  }

  componentDidMount() {
    this.updateSelectAll();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ data: nextProps.data });
    this.buildColumns(nextProps.project);
    this.buildIssueIdList(nextProps);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.loading !== nextProps.loading ||
      this.props.issues !== nextProps.issues ||
      this.props.project !== nextProps.project ||
      this.props.project.template !== nextProps.project.template ||
      this.props.location !== nextProps.location ||
      this.props.selection !== nextProps.selection ||
      this.state.columns !== nextState.columns);
  }

  componentDidUpdate() {
    this.updateSelectAll();
  }

  onChangeSelection(e) {
    const id = parseInt(e.target.dataset.id, 10);
    if (e.target.checked) {
      this.props.selectIssues([id]);
    } else {
      this.props.deselectIssues([id]);
    }
  }

  onChangeSelectAll(e) {
    if (e.target.checked) {
      this.props.selectIssues(this.issueIds);
    } else {
      this.props.clearSelection();
    }
  }

  onChangeSort(column, descending) {
    const { query = {} } = this.props.location;
    const sort = `${descending ? '-' : ''}${column}`;
    browserHistory.replace({ ...this.props.location, query: { ...query, sort } });
    // this.setState({ sort: column, descending });
  }

  buildColumns(project) {
    this.columnRenderers = {
      state: new TextColumnRenderer('State', 'state', 'state pad'),
      type: new TextColumnRenderer('Type', 'type', 'type pad'),
      reporter: new UserColumnRenderer('Reporter', 'reporter', 'reporter pad'),
      owner: new UserColumnRenderer('Owner', 'owner', 'owner pad'),
      created: new DateColumnRenderer('Created', 'created', 'created pad'),
      updated: new DateColumnRenderer('Updated', 'updated', 'updated pad'),
    };
    if (project) {
      for (const type of this.props.project.template.types) {
        if (type.fields) {
          for (const field of type.fields) {
            this.columnRenderers[`custom.${field.id}`] = new CustomColumnRenderer(field);
          }
        }
      }
    }
  }

  buildIssueIdList(props) {
    const { issues } = props;
    if (!issues) {
      this.issueIds = [];
    } else {
      this.issueIds = issues.map(i => i.id);
    }
    this.issueIdSet = new Immutable.Set(this.issueIds);
  }

  // Checkbox 'indeterminate' state can only be set programmatically.
  updateSelectAll() {
    const { selection } = this.props;
    if (this.selectAll) {
      const noneSelected = selection.size === 0;
      const allSelected = this.issueIdSet.isSubset(selection);
      this.selectAll.indeterminate = !allSelected && !noneSelected;
    }
  }

  renderHeader() {
    const { selection } = this.props;
    const { query = {} } = this.props.location;
    const sortOrder = query.sort || '-updated';
    const descending = sortOrder.startsWith('-');
    const sort = descending ? sortOrder.slice(1) : sortOrder;
    // const { sort, descending } = this.state;
    return (
      <thead>
        <tr className="heading">
          <th className="selected">
            <label htmlFor="all-issues">
              <Checkbox
                  id="all-issues"
                  bsClass="cbox"
                  checked={selection.size > 0}
                  inputRef={el => { this.selectAll = el; }}
                  onChange={this.onChangeSelectAll} />
            </label>
          </th>
          <th className="id">
            <ColumnSort
                column="id"
                sortKey={sort}
                descending={descending}
                onChangeSort={this.onChangeSort}>
              #
            </ColumnSort>
          </th>
          {this.state.columns.map(cname => {
            const cr = this.columnRenderers[cname];
            if (cr) {
              return cr.renderHeader(sort, descending, this.onChangeSort);
            }
            return <th className="custom center" key={cname}>--</th>;
          })}
          <th className="summary">
            <ColumnSort
                column="summary"
                sortKey={sort}
                descending={descending}
                onChangeSort={this.onChangeSort}>
              Summary
            </ColumnSort>
          </th>
        </tr>
      </thead>
    );
  }

  renderIssue(issue) {
    const { project, selection, labels } = this.props;
    const linkTarget = {
      pathname: `/project/${project.name}/issues/${issue.id}`,
      state: {
        back: this.props.location,
        idList: this.issueIds,
      },
    };
    const issueId = `issue-${issue.id}`;
    return (
      <tr key={issue.id}>
        <td className="selected">
          <label htmlFor={issueId}>
            <Checkbox
                id={issueId}
                bsClass="cbox"
                data-id={issue.id}
                checked={selection.has(issue.id)}
                onChange={this.onChangeSelection} />
          </label>
        </td>
        <td className="id">
          <Link to={linkTarget}>{issue.id}</Link>
        </td>
        {this.state.columns.map(cname => {
          const cr = this.columnRenderers[cname];
          if (cr) {
            return cr.render(issue);
          }
          return <td className="custom" key={cname} />;
        })}
        <td className="title">
          <Link to={linkTarget}>
            <span className="summary">{issue.summary}</span>
            {issue.labels
              .filter(l => labels.has(l))
              .map(l => <LabelName project={project.id} label={l} key={l} />)}
          </Link>
        </td>
      </tr>);
  }

  render() {
    const { issues, loading } = this.props;
    if (!issues || issues.length === 0) {
      if (loading) {
        return <div className="card report" />;
      }
      return (
        <div className="card report">
          <div className="no-issues">No issues found</div>
        </div>
      );
    }

    return (
      <div className="card report">
        <table className="issue">
          {this.renderHeader()}
          <tbody>{issues.map(i => this.renderIssue(i))}</tbody>
        </table>
      </div>
    );
  }
}

IssueList.propTypes = {
  loading: PropTypes.bool,
  issues: PropTypes.arrayOf(PropTypes.shape({})),
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    template: PropTypes.shape({
      types: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  }).isRequired,
  location: PropTypes.shape({
    query: PropTypes.shape({}),
  }).isRequired,
  labels: ImmutablePropTypes.set.isRequired,
  selection: ImmutablePropTypes.set.isRequired,
  clearSelection: PropTypes.func.isRequired,
  selectIssues: PropTypes.func.isRequired,
  deselectIssues: PropTypes.func.isRequired,
};

export default connect(
  (state) => ({
    selection: state.issueSelection,
  }),
  dispatch => bindActionCreators({ clearSelection, selectIssues, deselectIssues }, dispatch),
)(IssueList);
