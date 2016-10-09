import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ProjectCard from './projectCard.jsx';
import { fetchUserInfo } from '../../store/userInfo';

class ProjectList extends React.Component {
  render() {
    const { projects } = this.props;
    return (<div className="project-list">
      {projects.map(p => (<ProjectCard project={p} key={p.name} />))}
    </div>);
  }
}

ProjectList.propTypes = {
  projects: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      // name: React.PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  profile: React.PropTypes.shape({
    // id: React.PropTypes.string,
  }),
  fetchUserInfo: React.PropTypes.func.isRequired,
};

export default connect(
  (state) => ({
    projects: state.projects.idList.map(id => state.projects.byId.get(id)),
    profile: state.profile,
  }),
  dispatch => bindActionCreators({ fetchUserInfo }, dispatch),
)(ProjectList);
