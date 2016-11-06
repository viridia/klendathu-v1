import React, { PropTypes } from 'react';
import DashboardNav from './dashboardNav.jsx';
import Dashboard from './dashboard.jsx';

export default function DashboardPage({ params }) {
  return (<div className="content">
    <DashboardNav />
    <Dashboard params={params} />
  </div>);
}

DashboardPage.propTypes = {
  params: PropTypes.shape({}).isRequired,
};
