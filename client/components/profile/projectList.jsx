import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ProjectCard from './projectCard.jsx';
import { fetchUserInfo } from '../../store/actions';

class ProjectList extends React.Component {
  render() {
    const { projects, user } = this.props;
    this.props.fetchUserInfo(user.id);
    return (<div className="project-list">
      {projects.map(p => (<ProjectCard project={p} user={user} key={p.name} />))}
    </div>);
  }
}

ProjectList.propTypes = {
  projects: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      // name: React.PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  user: React.PropTypes.shape({
    // id: React.PropTypes.string,
  }),
  fetchUserInfo: React.PropTypes.func.isRequired,
};

export default connect(
  (state) => ({
    projects: state.projects.idList.map(id => state.projects.byId.get(id)),
    user: state.user,
  }),
  dispatch => bindActionCreators({ fetchUserInfo }, dispatch),
)(ProjectList);
