import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import { Link } from 'react-router';
import classNames from 'classnames';
import LabelName from '../common/labelName.jsx';
import { clearSelection, selectIssues, deselectIssues } from '../../store/issueSelection';

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
    this.onChangeSelection = this.onChangeSelection.bind(this);
    this.onChangeSelectAll = this.onChangeSelectAll.bind(this);
    this.state = {
      columns: ['priority', 'severity'],
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
    const { project, selection } = this.props;
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
          <tbody>
            {issues.map(i => this.renderIssue(i))}
          </tbody>
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
  location: PropTypes.shape({}).isRequired,
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
