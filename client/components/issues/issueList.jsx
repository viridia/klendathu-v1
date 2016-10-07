import React from 'react';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import './issues.scss';

export default class IssueList extends React.Component {
  // constructor() {
  //   axios.get('projects').then(resp => {
  //     console.log(resp.data);
  //   }, err => {
  //     console.error(err);
  //   });
  //   super();
  // }

  render() {
    return (<section className="kdt issue-list">
      <div className="card">
        <div className="filters">
          <div className="kdt expander" />
          Filters
        </div>
      </div>
      <div className="card">
        <table className="issue">
          <thead>
            <tr className="heading">
              <th className="selected"><Checkbox /></th>
              <th className="id">#</th>
              <th className="type">Type</th>
              <th className="owner">Owner</th>
              <th className="state">State</th>
              <th className="custom">Priority</th>
              <th className="summary">Summary</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <tr key={n}>
                <td className="selected"><Checkbox /></td>
                <td className="id">{n}</td>
                <td className="type">feature</td>
                <td className="owner">viridia</td>
                <td className="state">open</td>
                <td className="custom">high</td>
                <td className="summary">
                  Create nimblet from template
                  <span className="tag">release-blockers</span>
                  <span className="tag">technical-debt</span>
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div className="no-issues">No issues found</div>
      </div>
    </section>);
  }
}
