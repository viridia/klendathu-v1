import client from './apollo';
import NewLabelMutation from '../graphql/mutations/newLabel.graphql';
import UpdateLabelMutation from '../graphql/mutations/updateLabel.graphql';
import DeleteLabelMutation from '../graphql/mutations/deleteLabel.graphql';

export function createLabel(project, label) {
  return client.mutate({
    mutation: NewLabelMutation,
    variables: {
      project,
      label,
    },
    updateQueries: {
      labelsQuery: (previousQueryResult, { mutationResult }) => {
        return {
          labels: [...previousQueryResult.labels, mutationResult.data.newLabel],
        };
      },
    },
  });
}

export function updateLabel(project, id, label) {
  return client.mutate({
    mutation: UpdateLabelMutation,
    variables: { project, id, label },
  });
}

export function deleteLabel(project, id) { // eslint-disable-line
  return client.mutate({
    mutation: DeleteLabelMutation,
    variables: { project, label: id },
    refetchQueries: ['projectMembershipQuery'],
    updateQueries: {
      labelsQuery: (previousQueryResult, { mutationResult }) => {
        return {
          labels: previousQueryResult.labels.filter(
            l => l.id !== mutationResult.data.deleteLabel),
        };
      },
      labelsSearchQuery: (previousQueryResult, { mutationResult }) => {
        return {
          labels: previousQueryResult.labels.filter(
            l => l.id !== mutationResult.data.deleteLabel),
        };
      },
    },
  });
}
