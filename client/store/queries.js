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

export const ProjectQuery = gql`query projectQuery($project: String!) {
  project(name: $project) {
    ...projectContent
  }
}`;

export const IssueQuery = gql`query issueQuery($project: ID!, $id: Int!) {
  issue(project: $project, id: $id) {
    ...issueContent
  }
}`;
