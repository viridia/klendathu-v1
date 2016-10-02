import React from 'react';
import AppsIcon from 'icons/ic_apps_black_24px.svg';
import { NavItem } from '../common/leftNav.jsx';

export default class DashboardNav extends React.Component {
  render() {
    return (<nav className="kdt left-nav">
      <NavItem icon={<AppsIcon />} title="Dashboard" onlyActiveOnIndex path="/" />
    </nav>);
  }
}
