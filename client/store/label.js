import gql from 'graphql-tag';
import client from './apollo';

export const NewLabelMutation = gql`mutation NewLabelMutation($project: ID!, $label: LabelInput!) {
  newLabel(project: $project, label: $label) {
    project
    id
    name
    color
    creator
    created
  }
}`;

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

const UpdateLabel = gql`mutation updateLabelMutation(
    $project: ID!, $id: Int!, $label: LabelInput!) {
  updateLabel(project: $project, id: $id, label: $label) {
    project
    id
    name
    color
    creator
    created
  }
}`;

export function updateLabel(project, id, label) {
  return client.mutate({
    mutation: UpdateLabel,
    variables: { project, id, label },
  });
}

const DeleteLabel = gql`mutation DeleteLabelMutation($project: ID!, $label: Int!) {
  deleteLabel(project: $project, id: $label)
}`;

export function deleteLabel(project, id) { // eslint-disable-line
  return client.mutate({
    mutation: DeleteLabel,
    variables: { project, label: id },
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
