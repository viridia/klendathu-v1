import React from 'react';
import DashboardNav from '../dashboard/dashboardNav.jsx';

export default class NotFound extends React.Component {
  render() {
    return (<div className="kdt page">
      <DashboardNav />
      <section>
        Page not found.
      </section>
    </div>);
  }
}
