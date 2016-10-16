import gql from 'graphql-tag';
import client from './apollo';

const NewProject = gql`mutation NewProjectMutation($project: ProjectInput) {
  newProject(project: $project) { id }
}`;

export function createProject(project) {
  return client.mutate({
    mutation: NewProject,
    variables: { project },
  });
}

const DeleteProject = gql`mutation DeleteProjectMutation($id: ID!) {
  deleteProject(id: $id) { id }
}`;

export function deleteProject(id) {
  return client.mutate({
    mutation: DeleteProject,
    variables: { id },
  });
}

const UpdateProject = gql`mutation UpdateProject($id: ID!, $title: String, $description: String) {
  updateProject(id: $id, description: $description, title: $title) {
    projects {
      id
      name
      description
      title
      owningUser
      owningOrg
      role
    }
  }
}`;

export function saveProject(pid, variables) {
  return client.mutate({
    mutation: UpdateProject,
    variables: { ...variables, id: pid },
  });
}
