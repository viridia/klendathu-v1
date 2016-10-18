import gql from 'graphql-tag';

export const ProjectListQuery = gql`query projectListQuery {
  projects {
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

export const dummy = 1;
