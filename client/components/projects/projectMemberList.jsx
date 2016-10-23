import React, { PropTypes } from 'react';
import { graphql } from 'react-apollo';
import Button from 'react-bootstrap/lib/Button';
import { ProjectMembershipQuery } from '../../store/queries';
import AddMemberDialog from './addMemberDialog.jsx';
import { roleName } from '../../lib/role';

class ProjectMemberList extends React.Component {
  constructor() {
    super();
    this.onShowAddMember = this.onShowAddMember.bind(this);
    this.onHideAddMember = this.onHideAddMember.bind(this);
    this.onMemberAdded = this.onMemberAdded.bind(this);
    this.state = {
      showAddMember: false,
    };
  }

  onShowAddMember(e) {
    e.preventDefault();
    this.setState({ showAddMember: true });
  }

  onHideAddMember() {
    this.setState({ showAddMember: false });
  }

  onMemberAdded() {
    this.props.data.refetch();
  }

  renderMember(member) {
    return (
      <tr key={member.user}>
        <td className="center">{member.user}</td>
        <td className="center">{roleName(member.role).toLowerCase()}</td>
      </tr>
    );
  }

  render() {
    const { projectMemberships, loading } = this.props.data;
    if (loading || !projectMemberships) {
      return <section className="settings-tab-pane" />;
    }
    return (
      <section className="settings-tab-pane">
        {this.state.showAddMember && (
          <AddMemberDialog
              project={this.props.project}
              onHide={this.onHideAddMember}
              onAddMember={this.onMemberAdded} />)}
        <header>
          <div className="title">Project members for {this.props.project.name}</div>
          <Button onClick={this.onShowAddMember}>Add Member</Button>
        </header>
        <div className="card report">
          <table>
            <thead>
              <tr className="heading">
                <th className="center">User</th>
                <th className="center">Role</th>
              </tr>
            </thead>
            <tbody>
              {projectMemberships.map(m => this.renderMember(m))}
            </tbody>
          </table>
        </div>
      </section>);
  }
}

ProjectMemberList.propTypes = {
  data: PropTypes.shape({
    error: PropTypes.shape({}),
    loading: PropTypes.bool,
    projectMemberships: PropTypes.arrayOf(PropTypes.shape({})),
    refetch: PropTypes.func.isRequired,
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  params: PropTypes.shape({
    project: PropTypes.string,
  }).isRequired,
};

export default graphql(ProjectMembershipQuery, {
  options: ({ project }) => ({ variables: { project: project.id } }),
})(ProjectMemberList);
