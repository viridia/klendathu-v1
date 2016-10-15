import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import AddBoxIcon from 'icons/ic_add_box_black_24px.svg';
import DashboardNav from './dashboardNav.jsx';
import ProjectList from '../projects/projectList.jsx';
import './dashboard.scss';

export default class Dashboard extends React.Component {
  render() {
    if (!this.context.profile) {
      return <div className="content" />;
    }
    return (<div className="content">
      <DashboardNav />
      <section className="kdt dashboard">
        <header>
          <div className="title">
            Projects
          </div>
          <Button bsStyle="primary"><AddBoxIcon />New Project...</Button>
        </header>
        <ProjectList />
      </section>;
    </div>);
  }
}

Dashboard.contextTypes = {
  profile: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    username: React.PropTypes.string.isRequired,
  }),
};
