import gql from 'graphql-tag';
import { createFragment } from 'apollo-client';

export const ProjectContent = createFragment(gql`
  fragment projectContent on Project {
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
`);

export const IssueContent = createFragment(gql`
  fragment issueContent on Issue {
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
`);

export const LabelContent = createFragment(gql`
  fragment labelContent on Label {
    project
    id
    name
    color
    creator
    created
  }
`);

export const ProjectMembershipContent = createFragment(gql`
  fragment projectMembershipContent on ProjectMembership {
    user
    role
    labels
    queries {
      name
    }
  }
`);
