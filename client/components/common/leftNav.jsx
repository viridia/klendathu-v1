import React from 'react';
import { Link } from 'react-router';
import AppsIcon from 'icons/ic_apps_black_24px.svg';
import ListIcon from 'icons/ic_list_black_24px.svg';
import BookmarkIcon from 'icons/ic_bookmark_border_black_24px.svg';
import PersonIcon from 'icons/ic_person_black_24px.svg';
import SettingsIcon from 'icons/ic_settings_black_24px.svg';
import LocalOfferIcon from 'icons/ic_local_offer_black_24px.svg';
import './leftNav.scss';

function NavItem({ title, icon, path, query = undefined, onlyActiveOnIndex = false }) {
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
    const { project } = this.props.params;
    return (<nav className="kdt left-nav">
      <NavItem icon={<AppsIcon />} title="Dashboard" onlyActiveOnIndex path="/" />
      <NavItem
          icon={<ListIcon />}
          title="All Issues"
          path={`/issues/${project}`}
          query={{ owner: undefined }} />
      <NavItem
          icon={<PersonIcon />}
          title="My Open Issues"
          path={`/issues/${project}`}
          query={{ owner: 'me', status: 'open' }} />
      <NavItem icon={<LocalOfferIcon />} title="Labels" path="/labels" />
      <ul>
        <li><Link to={`/label/${project}`}>release-blockers</Link></li>
        <li><Link to={`/label/${project}`}>feature-set-1</Link></li>
      </ul>
      <NavItem icon={<BookmarkIcon />} title="Saved Queries" path={`/queries/${project}`} />
      <NavItem icon={<SettingsIcon />} title="Project Settings" path={`/project/${project}`} />
    </nav>);
  }
}

LeftNav.propTypes = {
  params: React.PropTypes.shape({
    project: React.PropTypes.string.isRequired,
  }),
};
