import React from 'react';
import { Link } from 'react-router';
import AppsIcon from 'icons/ic_apps_black_24px.svg';
import ListIcon from 'icons/ic_list_black_24px.svg';
import BookmarkIcon from 'icons/ic_bookmark_border_black_24px.svg';
import PersonIcon from 'icons/ic_person_black_24px.svg';
import SettingsIcon from 'icons/ic_settings_black_24px.svg';
import LocalOfferIcon from 'icons/ic_local_offer_black_24px.svg';
import './leftNav.scss';

export function NavItem({ title, icon, path, query = undefined, onlyActiveOnIndex = false }) {
  return (<Link
      className="item"
      activeClassName="active"
      onlyActiveOnIndex={onlyActiveOnIndex}
      to={{ pathname: path, query }}>{icon}{title}</Link>);
}

NavItem.propTypes = {
  icon: React.PropTypes.node.isRequired,
  title: React.PropTypes.string.isRequired,
  path: React.PropTypes.string.isRequired,
  query: React.PropTypes.shape({}),
  onlyActiveOnIndex: React.PropTypes.bool,
};

export default class LeftNav extends React.Component {
  render() {
    const { project } = this.props;
    return (<nav className="kdt left-nav">
      <NavItem icon={<AppsIcon />} title="Dashboard" onlyActiveOnIndex path="/" />
      <NavItem
          icon={<ListIcon />}
          title="All Issues"
          path={`/project/${project}/issues`}
          query={{ owner: undefined }} />
      <NavItem
          icon={<PersonIcon />}
          title="My Open Issues"
          path={`/project/${project}/issues`}
          query={{ owner: 'me', status: 'open' }} />
      <NavItem
          icon={<LocalOfferIcon />}
          title="Labels"
          path={`/project/${project}/labels`} />
      <ul>
        <li><Link to={`/project/${project}/labels/1`}>release-blockers</Link></li>
        <li><Link to={`/project/${project}/labels/2`}>feature-set-1</Link></li>
      </ul>
      <NavItem
          icon={<BookmarkIcon />}
          title="Saved Queries"
          path={`/project/${project}/queries`} />
      <NavItem
          icon={<SettingsIcon />}
          title="Project Settings"
          path={`/project/${project}/settings`} />
    </nav>);
  }
}

LeftNav.propTypes = {
  project: React.PropTypes.string.isRequired,
};
