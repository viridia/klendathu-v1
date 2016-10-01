import React from 'react';
import './issues.scss';

export default class LabelList extends React.Component {
  render() {
    return (<section className="kdt issue-details">
      <heading>Labels</heading>
      <div className="card">
        <div className="filters">
          <div className="kdt expander" />
          Filters
        </div>
      </div>
    </section>);
  }
}
