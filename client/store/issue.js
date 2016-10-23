import client from './apollo';
import { IssueContent } from './fragments';
import NewIssueMutation from '../graphql/mutations/newIssue.graphql';
import UpdateIssueMutation from '../graphql/mutations/updateIssue.graphql';
import DeleteIssueMutation from '../graphql/mutations/deleteIssue.graphql';

export function createIssue(project, issue) {
  return client.mutate({
    mutation: NewIssueMutation,
    variables: { project, issue },
    fragments: IssueContent,
    // updateQueries: {
    //   projectListQuery: (previousQueryResult, { mutationResult }) => {
    //     return {
    //       projects: [mutationResult.data.newProject, ...previousQueryResult.projects],
    //     };
    //   },
    // },
  });
}

export function updateIssue(id, project, issue) {
  return client.mutate({
    mutation: UpdateIssueMutation,
    variables: { id, project, issue },
    fragments: IssueContent,
  });
}

export function deleteIssue(id) {
  return client.mutate({
    mutation: DeleteIssueMutation,
    variables: { id },
    // updateQueries: {
    //   projectListQuery: (previousQueryResult, { mutationResult }) => {
    //     console.log(mutationResult);
    //     return {
    //       projects: previousQueryResult.projects.filter(
    //         p => p.id !== mutationResult.data.deleteProject),
    //     };
    //   },
    // },
  });
}
