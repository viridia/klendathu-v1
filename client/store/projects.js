import gql from 'graphql-tag';
import client from './apollo';
import { ProjectContent } from './fragments';

const NewProject = gql`mutation NewProjectMutation($project: ProjectInput) {
  newProject(project: $project) {
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

export function createProject(project) {
  return client.mutate({
    mutation: NewProject,
    variables: { project },
    updateQueries: {
      projectListQuery: (previousQueryResult, { mutationResult }) => {
        return {
          projects: [mutationResult.data.newProject, ...previousQueryResult.projects],
        };
      },
    },
  });
}

const DeleteProject = gql`mutation DeleteProjectMutation($id: ID!) {
  deleteProject(id: $id)
}`;

export function deleteProject(id) {
  return client.mutate({
    mutation: DeleteProject,
    variables: { id },
    updateQueries: {
      projectListQuery: (previousQueryResult, { mutationResult }) => {
        console.log(mutationResult);
        return {
          projects: previousQueryResult.projects.filter(
            p => p.id !== mutationResult.data.deleteProject),
        };
      },
    },
  });
}

const UpdateProject = gql`mutation UpdateProject($id: ID!, $title: String, $description: String) {
  updateProject(id: $id, description: $description, title: $title) {
    projects {
      ...projectContent
    }
  }
}`;

export function saveProject(pid, variables) {
  return client.mutate({
    mutation: UpdateProject,
    variables: { ...variables, id: pid },
    fragments: [ProjectContent],
  });
}
