import client from './apollo';
import { IssueContent } from './fragments';
import NewIssueMutation from '../graphql/mutations/newIssue.graphql';
import UpdateIssueMutation from '../graphql/mutations/updateIssue.graphql';
import DeleteIssueMutation from '../graphql/mutations/deleteIssue.graphql';
import AddCommentMutation from '../graphql/mutations/addComment.graphql';

export function createIssue(project, issue) {
  return client.mutate({
    mutation: NewIssueMutation,
    variables: { project, issue },
    fragments: IssueContent,
    refetchQueries: ['issueListQuery'],
  });
}

export function updateIssue(project, id, issue) {
  return client.mutate({
    mutation: UpdateIssueMutation,
    variables: { id, project, issue },
    fragments: IssueContent,
    refetchQueries: ['issueListQuery', 'issueDetailsQuery'],
  });
}

export function addComment(project, id, comment) {
  return client.mutate({
    mutation: AddCommentMutation,
    variables: { id, project, comment },
    fragments: IssueContent,
  });
}

export function deleteIssue(id) {
  return client.mutate({
    mutation: DeleteIssueMutation,
    variables: { id },
    updateQueries: {
      issueListQuery: (previousQueryResult, { mutationResult }) => {
        return {
          issues: previousQueryResult.issues.filter(
            issue => issue.id !== mutationResult.data.deleteIssue),
        };
      },
    },
  });
}
