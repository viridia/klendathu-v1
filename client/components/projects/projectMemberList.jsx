import React, { PropTypes } from 'react';
import { graphql } from 'react-apollo';
import { ProjectMembershipQuery } from '../../store/queries';
import roleName from '../../lib/role';

class ProjectMemberList extends React.Component {
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
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  params: PropTypes.shape({
    project: PropTypes.string,
  }).isRequired,
};

export default graphql(ProjectMembershipQuery, {
  options: ({ project }) => ({ variables: { project: project.id } }),
})(ProjectMemberList);
