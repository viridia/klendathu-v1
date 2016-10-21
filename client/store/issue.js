import gql from 'graphql-tag';
import client from './apollo';
import { IssueContent } from './fragments';

const NewIssueMutation = gql`mutation NewIssueMutation($project: ID!, $issue: IssueInput!) {
  newIssue(project: $project, issue: $issue) {
    ...issueContent
  }
}`;

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

const UpdateIssueMutation = gql`mutation UpdateIssueMutation(
    $project: ID!, $id: Int!, $issue: IssueInput!) {
  updateIssue(id: $id, project: $project, issue: $issue) {
    ...issueContent
  }
}`;

export function updateIssue(id, project, issue) {
  return client.mutate({
    mutation: UpdateIssueMutation,
    variables: { id, project, issue },
    fragments: IssueContent,
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
