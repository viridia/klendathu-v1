import gql from 'graphql-tag';
import client from './apollo';
import { ProjectMembershipContent } from './fragments';

const UpdateProjectMembershipMutation = gql`mutation AddProjectMember
    ($project: ID!, $user: String!, $membership: ProjectMembershipInput!) {
  updateProjectMembership(project: $project, user: $user, membership: $membership) {
    ...projectMembershipContent
  }
}`;

export function updateProjectMembership(project, user, membership) {
  return client.mutate({
    mutation: UpdateProjectMembershipMutation,
    variables: { project, user, membership },
    fragments: ProjectMembershipContent,
    // updateQueries: {
    //   labelsQuery: (previousQueryResult, { mutationResult }) => {
    //     return {
    //       labels: [...previousQueryResult.labels, mutationResult.data.newLabel],
    //     };
    //   },
    // },
  });
}

export const dummy = 1;
