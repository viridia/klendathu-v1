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
    id name title
    description
    owningUser
    owningOrg
    role
    created updated
    template {
      name project
      types {
        id caption abstract extends
        fields { id type caption align default values }
      }
    }
    workflow {
      name project extends start
      states { id caption closed transitions }
    }
  }
}`;

export const IssueQuery = gql`query issueQuery($project: ID!, $id: Int!) {
  issue(project: $project, id: $id) {
    id
    project
    type
    state
    summary
    description
    reporter
    owner
    cc
    created
    updated
    labels
    custom {
      name
      value
    }
    ownerData {
      id
      username
      fullname
      photo
    }
    ccData {
      id
      username
      fullname
      photo
    }
    labelsData {
      id
      name
      color
    }
  }
}`;
