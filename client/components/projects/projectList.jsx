import React, { PropTypes } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import ProjectCard from './projectCard.jsx';

class ProjectList extends React.Component {
  constructor() {
    super();
    this.onProjectListChanged = this.onProjectListChanged.bind(this);
  }

  onProjectListChanged() {
    // TODO: This creates an exception in Apollo
    // this.props.data.refetch();
  }

  render() {
    const { projects, loading } = this.props.data;
    if (loading || !projects) {
      return <div className="project-list" />;
    }
    return (<div className="project-list">
      {projects.map(p => (
        <ProjectCard project={p} key={p.name} onChange={this.onProjectListChanged} />))}
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

const ProjectsQuery = gql`query {
  projects {
    id
    name
    title
    description
    owningUser
    owningOrg
    role
    created
    updated
  }
}`;

export default graphql(ProjectsQuery)(ProjectList);
