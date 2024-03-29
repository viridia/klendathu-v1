import React, { PropTypes } from 'react';
import { graphql } from 'react-apollo';
import { toastr } from 'react-redux-toastr';
import Immutable from 'immutable';
import Button from 'react-bootstrap/lib/Button';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import Modal from 'react-bootstrap/lib/Modal';
import dateFormat from 'dateformat';
import ErrorDisplay from '../debug/errorDisplay.jsx';
import LabelDialog from './labelDialog.jsx';
import LabelName from '../common/labelName.jsx';
import LabelsQuery from '../../graphql/queries/labels.graphql';
import { Role } from '../../lib/role';
import { deleteLabel } from '../../store/label';
import { updateProjectMembership } from '../../store/projectMembership';
import './labelList.scss';
import './../common/card.scss';

class LabelList extends React.Component {
  constructor(props) {
    super(props);
    this.onShowCreate = this.onShowCreate.bind(this);
    this.onHideCreate = this.onHideCreate.bind(this);
    this.onShowDelete = this.onShowDelete.bind(this);
    this.onHideDelete = this.onHideDelete.bind(this);
    this.onShowUpdate = this.onShowUpdate.bind(this);
    this.onCreateLabel = this.onCreateLabel.bind(this);
    this.onDeleteLabel = this.onDeleteLabel.bind(this);
    this.onChangeVisible = this.onChangeVisible.bind(this);
    this.state = {
      showCreate: false,
      showDelete: false,
      labelToDelete: null,
      labelToUpdate: null,
      visible: this.visibleSet(props),
      busy: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ visible: this.visibleSet(nextProps) });
  }

  onShowCreate(e) {
    e.preventDefault();
    this.setState({ showCreate: true, labelToUpdate: null });
  }

  onHideCreate() {
    this.setState({ showCreate: false });
  }

  onCreateLabel() {}

  onShowDelete(e, label) {
    e.preventDefault();
    this.setState({ showDelete: true, labelToDelete: label });
  }

  onHideDelete(e) {
    e.preventDefault();
    this.setState({ showDelete: false });
  }

  onDeleteLabel(ev) {
    ev.preventDefault();
    this.setState({ busy: true });
    deleteLabel(this.props.project.id, this.state.labelToDelete.id).then(() => {
      this.setState({ showDelete: false, busy: false });
    }, error => {
      console.error(error);
      if (error.response && error.response.data && error.response.data.err) {
        toastr.error('Operation failed.', `Server returned '${error.response.data.err}'`);
      } else {
        toastr.error('Operation failed.', error.message);
      }
      this.setState({ showDelete: false, busy: false });
    });
  }

  onShowUpdate(e, label) {
    e.preventDefault();
    this.setState({ showCreate: true, labelToUpdate: label });
  }

  onChangeVisible(e) {
    const { project } = this.props;
    const { username } = this.context.profile;
    const id = parseInt(e.target.dataset.id, 10);
    if (e.target.checked) {
      updateProjectMembership(project.id, username, { addLabels: [id] });
    } else {
      updateProjectMembership(project.id, username, { removeLabels: [id] });
    }
  }

  visibleSet(props) {
    const { projectMembership } = props.data;
    return new Immutable.Set(projectMembership ? projectMembership.labels : []);
  }

  renderLabel(label) {
    const { project } = this.props;
    return (
      <tr key={label.id}>
        <td className="label-id center">{label.id}</td>
        <td className="visible center">
          <Checkbox
              bsClass="cbox"
              data-id={label.id}
              checked={this.state.visible.has(label.id)}
              onChange={this.onChangeVisible} />
        </td>
        <td className="name center"><LabelName project={label.project} label={label.id} /></td>
        <td className="creator center">label.creator</td>
        <td className="created center">{dateFormat(label.created, 'mmm dS, yyyy h:MM TT')}</td>
        {project.role >= Role.DEVELOPER && (<td className="actions center">
          <Button data-label={label.id} onClick={e => this.onShowUpdate(e, label)}>Edit</Button>
          <Button data-label={label.id} onClick={e => this.onShowDelete(e, label)}>Delete</Button>
        </td>)}
      </tr>);
  }

  renderLabels() {
    const { project } = this.props;
    const { labels } = this.props.data;
    if (!labels || labels.length === 0) {
      return (
        <div className="card report">
          <div className="no-issues">No labels defined</div>
        </div>
      );
    }
    return (<div className="card report">
      <table>
        <thead>
          <tr className="heading">
            <th className="id center">#</th>
            <th className="visible center">Hotlist</th>
            <th className="name center">Label</th>
            <th className="owner center">Creator</th>
            <th className="created center">Created</th>
            {project.role >= Role.DEVELOPER && <th className="actions">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {labels.map(i => this.renderLabel(i))}
        </tbody>
      </table>
    </div>);
  }

  render() {
    const { error } = this.props.data;
    const { project } = this.props;
    if (error) {
      return <ErrorDisplay error={error} />;
    }
    return (<section className="kdt label-list">
      {this.state.showCreate && (
        <LabelDialog
            project={this.props.project}
            label={this.state.labelToUpdate}
            visible={!this.state.labelToUpdate
                || this.state.visible.has(this.state.labelToUpdate.id)}
            onHide={this.onHideCreate}
            onInsertLabel={this.onCreateLabel} />)}
      {this.state.showDelete && (
        <Modal show onHide={this.onHideDelete}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Label</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you absolutely sure you want to label &apos;{this.state.labelToDelete.name}&apos;?
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.onHideDelete}>Cancel</Button>
            <Button bsStyle="primary" onClick={this.onDeleteLabel}>Delete</Button>
          </Modal.Footer>
        </Modal>
      )}
      <header>
        <span className="title">Labels</span>
        {project.role >= Role.DEVELOPER && <Button onClick={this.onShowCreate}>New Label</Button>}
      </header>
      {this.renderLabels()}
    </section>);
  }
}

LabelList.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.number.isRequired,
  }).isRequired,
  data: PropTypes.shape({
    error: PropTypes.shape({}),
    labels: PropTypes.arrayOf(PropTypes.shape({})),
    projectMembership: PropTypes.shape({}),
  }).isRequired,
};

LabelList.contextTypes = {
  profile: PropTypes.shape({}),
};

export default graphql(LabelsQuery, {
  options: ({ project }) => ({ variables: { project: project.id } }),
})(LabelList);
