import React, { PropTypes } from 'react';
import { graphql } from 'react-apollo';
import UserName from '../common/userName.jsx';
import { ProjectMemberListQuery } from '../../store/queries';

class ProjectMemberList extends React.Component {
  render() {
    const { users, loading } = this.props.data;
    if (loading || !users) {
      return <div className="project-list" />;
    }
    return (<div className="user-list">
      {users.map(u => <UserName user={u} key={u.username} />)}
    </div>);
  }
}

ProjectMemberList.propTypes = {
  data: PropTypes.shape({
    error: PropTypes.shape({}),
    loading: PropTypes.bool,
    users: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  params: PropTypes.shape({
    project: PropTypes.string,
  }).isRequired,
};

export default graphql(ProjectMemberListQuery, {
  options: ({ project }) => ({ variables: { project: project.id } }),
})(ProjectMemberList);
