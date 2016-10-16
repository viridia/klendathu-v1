import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import AppsIcon from 'icons/ic_apps_black_24px.svg';
import ListIcon from 'icons/ic_list_black_24px.svg';
import BookmarkIcon from 'icons/ic_bookmark_border_black_24px.svg';
import PersonIcon from 'icons/ic_person_black_24px.svg';
import SettingsIcon from 'icons/ic_settings_black_24px.svg';
import LocalOfferIcon from 'icons/ic_local_offer_black_24px.svg';
import LabelName from './labelName.jsx';
import './leftNav.scss';

export function NavItem({ title, icon, path, query = undefined, onlyActiveOnIndex = false }) {
  return (<Link
      className="item"
      activeClassName="active"
      onlyActiveOnIndex={onlyActiveOnIndex}
      to={{ pathname: path, query }}>{icon}{title}</Link>);
}

NavItem.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  query: PropTypes.shape({}),
  onlyActiveOnIndex: PropTypes.bool,
};

class LeftNav extends React.Component {
  render() {
    const { project } = this.props;
    const { labels } = this.props.data;
    return (<nav className="kdt left-nav">
      <NavItem icon={<AppsIcon />} title="Dashboard" onlyActiveOnIndex path="/" />
      <NavItem
          icon={<ListIcon />}
          title="All Issues"
          path={`/project/${project.name}/issues`}
          query={{ owner: undefined }} />
      <NavItem
          icon={<PersonIcon />}
          title="My Open Issues"
          path={`/project/${project.name}/issues`}
          query={{ owner: 'me', status: 'open' }} />
      <NavItem
          icon={<LocalOfferIcon />}
          title="Labels"
          path={`/project/${project.name}/labels`} />
      <ul className="label-list">
        {labels && labels.map(label => (
          <li className="label-item" key={label.id}>
            <Link to={`/project/${project.name}/labels/${label.id}`}>
              <LabelName label={label.id} />
            </Link>
          </li>
        ))}
      </ul>
      <NavItem
          icon={<BookmarkIcon />}
          title="Saved Queries"
          path={`/project/${project.name}/queries`} />
      <NavItem
          icon={<SettingsIcon />}
          title="Project Settings"
          path={`/project/${project.name}/settings`} />
    </nav>);
  }
}

LeftNav.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
};

const LabelQuery = gql`query LabelQuery($project:ID!) {
  labels(project: $project) {
    id
    name
    color
  }
}`;

export default graphql(LabelQuery, {
  options: ({ project }) => ({ variables: { project: project.id } }),
})(LeftNav);
