import gql from 'graphql-tag';
import client from './apollo';

const NewIssueMutation = gql`mutation NewIssueMutation($project: ID!, $issue: IssueInput!) {
  newIssue(project: $project, issue: $issue) {
    id
  }
}`;

export function createIssue(project, issue) {
  return client.mutate({
    mutation: NewIssueMutation,
    variables: { project, issue },
    // updateQueries: {
    //   projectListQuery: (previousQueryResult, { mutationResult }) => {
    //     return {
    //       projects: [mutationResult.data.newProject, ...previousQueryResult.projects],
    //     };
    //   },
    // },
  });
}

const UpdateIssueMutation = gql`mutation UpdateIssueMutation($id: ID!, $issue: IssueInput!) {
  updateIssue(id: $id, issue: $issue) {
    id
  }
}`;

export function updateIssue(id, issue) {
  return client.mutate({
    mutation: UpdateIssueMutation,
    variables: { id, issue },
  });
}

const DeleteIssue = gql`mutation DeleteIssueMutation($id: ID!) {
  deleteIssue(id: $id)
}`;

export function deleteIssue(id) {
  return client.mutate({
    mutation: DeleteIssue,
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
