import client from './apollo';
import { ProjectContent } from './fragments';
import NewProjectMutation from '../graphql/mutations/newProject.graphql';
import UpdateProjectMutation from '../graphql/mutations/updateProject.graphql';
import DeleteProjectMutation from '../graphql/mutations/deleteProject.graphql';

export function createProject(project) {
  return client.mutate({
    mutation: NewProjectMutation,
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

export function deleteProject(id) {
  return client.mutate({
    mutation: DeleteProjectMutation,
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

export function saveProject(pid, variables) {
  return client.mutate({
    mutation: UpdateProjectMutation,
    variables: { ...variables, id: pid },
    fragments: [ProjectContent],
  });
}
