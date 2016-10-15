import React, { PropTypes } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import ProjectCard from './projectCard.jsx';

class ProjectList extends React.Component {
  render() {
    const { projects, loading } = this.props.data;
    if (loading || !projects) {
      return <div className="project-list" />;
    }
    return (<div className="project-list">
      {projects.map(p => (<ProjectCard project={p} key={p.name} />))}
    </div>);
  }
}

ProjectList.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool,
    projects: PropTypes.arrayOf(
      PropTypes.shape({}).isRequired,
    ),
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
    created
    updated
  }
}`;

export default graphql(ProjectsQuery)(ProjectList);
