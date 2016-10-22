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

export const LabelQuery = gql`query labelQuery($project: ID!, $label: Int!) {
  label(project: $project, id: $label) {
    project
    id
    name
    color
  }
}`;

export const LabelsQuery = gql`query labelsQuery($project:ID!) {
  labels(project: $project) {
    project
    id
    name
    color
    creator
    created
  }
}`;

export const LabelSearchQuery = gql`query labelsQuery($project:ID!, $token:String!) {
  labels(project: $project, token: $token) {
    project
    id
    name
    color
  }
}`;
