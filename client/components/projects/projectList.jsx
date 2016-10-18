import React, { PropTypes } from 'react';
import { graphql } from 'react-apollo';
import ProjectCard from './projectCard.jsx';
import { ProjectListQuery } from '../../store/queries';

class ProjectList extends React.Component {
  render() {
    const { projects, loading } = this.props.data;
    if (loading || !projects) {
      return <div className="project-list" />;
    }
    return (<div className="project-list">
      {projects.map(p => <ProjectCard project={p} key={p.name} />)}
    </div>);
  }
}

ProjectList.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool,
    projects: PropTypes.arrayOf(
      PropTypes.shape({}).isRequired,
    ),
    refetch: PropTypes.func.isRequired,
  }).isRequired,
};

export default graphql(ProjectListQuery)(ProjectList);
