import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import Modal from 'react-bootstrap/lib/Modal';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { toastr } from 'react-redux-toastr';
import { updateProjectMembership } from '../../store/projectMembership';
import UserAutoComplete from '../common/userAutoComplete.jsx';
import { roles, roleName } from '../../lib/role';
import '../common/ac/chip.scss';
import './addMemberDialog.scss';

export default class AddMemberDialog extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeUser = this.onChangeUser.bind(this);
    this.onSelectRole = this.onSelectRole.bind(this);
    this.onAddMember = this.onAddMember.bind(this);
    this.state = {
      user: null,
      role: null,
      busy: false,
    };
  }

  onChangeUser(selection) {
    this.setState({ user: selection });
  }

  onSelectRole(role) {
    this.setState({ role });
  }

  onAddMember(e) {
    const { project } = this.props;
    const { user, role } = this.state;
    e.preventDefault();
    this.setState({ busy: true });
    return updateProjectMembership(project.id, user.username, { role }).then(result => {
      this.setState({ busy: false });
      if (this.props.onAddMember) {
        this.props.onAddMember(result.data.updateProjectMembership);
      }
      this.props.onHide();
    }, error => {
      console.error(error);
      if (error.response && error.response.data && error.response.data.err) {
        toastr.error('Operation failed.', `Server returned '${error.response.data.err}'`);
      } else {
        toastr.error('Operation failed.', error.message);
      }
    });
  }

  renderRoleSelector() {
    return (
      <DropdownButton
          bsSize="small"
          title={this.state.role === null
              ? 'select role...' : roleName(this.state.role).toLowerCase()}
          id="select-role"
          onSelect={this.onSelectRole}>
        {roles()
            .filter(([level]) => level > 0 && level < 100)
            .map(([level, name]) => (
              <MenuItem eventKey={level} key={level} active={level === this.state.role}>
                {name.toLowerCase()}
              </MenuItem>))}
      </DropdownButton>
    );
  }

  render() {
    const { project } = this.props;
    const { user, role } = this.state;
    return (
      <Modal
          show
          onHide={this.props.onHide}
          dialogClassName="add-member">
        <Modal.Header closeButton>
          <Modal.Title>Add Project Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UserAutoComplete
              project={project}
              placeholder="select user..."
              selection={user}
              autoFocus
              onSelectionChange={this.onChangeUser} />
          {this.renderRoleSelector()}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Cancel</Button>
          <Button
              onClick={this.onAddMember}
              disabled={user === null || role === null || this.state.busy}
              bsStyle="primary">Add</Button>
        </Modal.Footer>
      </Modal>);
  }
}

AddMemberDialog.propTypes = {
  project: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
  }).isRequired,
  onHide: React.PropTypes.func.isRequired,
  onAddMember: React.PropTypes.func,
};
