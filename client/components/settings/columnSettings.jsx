import React, { PropTypes } from 'react';
import { graphql } from 'react-apollo';
import Immutable from 'immutable';
import Button from 'react-bootstrap/lib/Button';
import { toastr } from 'react-redux-toastr';
import ProjectMembershipQuery from '../../graphql/queries/projectMembership.graphql';
import { updateProjectMembership } from '../../store/projectMembership';
import ColumnList from './columnList.jsx';
import './columnSettings.scss';

/** Component which allows editing the list of columns. */
class ColumnSettings extends React.Component {
  constructor(props) {
    super(props);
    this.onDrop = this.onDrop.bind(this);
    this.onSave = this.onSave.bind(this);
    this.buildColumnList();
    this.state = {
      visible: Immutable.List.of('type', 'state', 'owner', 'updated'),
      busy: false,
    };
    if (this.props.data && this.props.data.projectMembership &&
        this.props.data.projectMembership.columns) {
      this.state.visible = new Immutable.List(this.props.data.projectMembership.columns);
    }
    this.state.original = this.state.visible;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data && nextProps.data.projectMembership &&
        nextProps.data.projectMembership.columns) {
      const columns = new Immutable.List(nextProps.data.projectMembership.columns)
          .filter(id => this.columnMap.has(id));
      this.setState({ visible: columns, original: columns });
    }
  }

  onSave(e) {
    const { project } = this.props;
    e.preventDefault();
    this.setState({ busy: true });
    return updateProjectMembership(project.id, this.context.profile.username, {
      columns: this.state.visible,
    }).then(() => {
      this.setState({ busy: false, original: this.state.columns });
    }, error => {
      console.error(error);
      if (error.response && error.response.data && error.response.data.err) {
        toastr.error('Operation failed.', `Server returned '${error.response.data.err}'`);
      } else {
        toastr.error('Operation failed.', error.message);
      }
    });
  }

  onDrop(id, index, visible, makeVisible) {
    if (visible) {
      const oldIndex = this.state.visible.indexOf(id);
      if (!makeVisible) {
        this.setState({ visible: this.state.visible.delete(oldIndex) });
        return;
      }
      let newIndex = index;
      if (oldIndex > 0 && oldIndex < index) {
        newIndex -= 1;
      }
      this.setState({ visible: this.state.visible.delete(oldIndex).insert(newIndex, id) });
    } else {
      this.setState({ visible: this.state.visible.insert(index, id) });
    }
  }

  buildColumnList() {
    const { project } = this.props;
    this.columns = [
      { id: 'created', title: 'Created' },
      { id: 'updated', title: 'Updated' },
      { id: 'type', title: 'Type' },
      { id: 'reporter', title: 'Reporter' },
      { id: 'owner', title: 'Owner' },
      { id: 'state', title: 'State' },
    ];
    if (project) {
      for (const [title, id] of project.template.customFieldList) {
        this.columns.push({ id: `custom.${id}`, title });
      }
    }
    this.columnMap = new Map();
    this.columns.forEach(col => { this.columnMap.set(col.id, col); });
  }

  render() {
    const { projectMembership, loading } = this.props.data;
    // const { project } = this.props;
    const { visible } = this.state;
    if (loading || !projectMembership) {
      return <section className="settings-tab-pane" />;
    }
    const visibleColumns = visible.map(id => this.columnMap.get(id)).toArray();
    const availableColumns = this.columns.filter(col => visible.indexOf(col.id) < 0);
    const canSave = !Immutable.is(this.state.visible, this.state.original) && !this.state.busy;
    return (
      <section className="settings-tab-pane">
        <header>
          <div className="title">Issue List Columns</div>
          <Button bsStyle="primary" onClick={this.onSave} disabled={!canSave}>
            Save
          </Button>
        </header>
        <section className="column-selection">
          <section className="columns">
            <header>Available Columns</header>
            <ColumnList columns={availableColumns} onDrop={this.onDrop} />
          </section>
          <section className="columns">
            <header>Visible Columns</header>
            <ColumnList columns={visibleColumns} onDrop={this.onDrop} isVisible />
          </section>
        </section>
      </section>);
  }
}

ColumnSettings.propTypes = {
  data: PropTypes.shape({
    error: PropTypes.shape({}),
    loading: PropTypes.bool,
    projectMembership: PropTypes.shape({
      columns: PropTypes.arrayOf(PropTypes.string.isRequired),
    }),
    refetch: PropTypes.func.isRequired,
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.number.isRequired,
  }).isRequired,
};

ColumnSettings.contextTypes = {
  profile: PropTypes.shape({}),
};

export default graphql(ProjectMembershipQuery, {
  options: ({ project }) => ({ variables: { project: project.id } }),
})(ColumnSettings);
