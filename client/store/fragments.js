import { createFragment } from 'apollo-client';
import projectContentFragment from '../graphql/fragments/projectContent.graphql';
import issueContentFragment from '../graphql/fragments/issueContent.graphql';
import labelContentFragment from '../graphql/fragments/labelContent.graphql';
import projectMembershipContentFragment from '../graphql/fragments/projectMembershipContent.graphql';

export const ProjectContent = createFragment(projectContentFragment);
export const IssueContent = createFragment(issueContentFragment);
export const LabelContent = createFragment(labelContentFragment);
export const ProjectMembershipContent = createFragment(projectMembershipContentFragment);
