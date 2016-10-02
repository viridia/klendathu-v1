import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import AddBoxIcon from 'icons/ic_add_box_black_24px.svg';
import ProjectList from '../projects/projectList.jsx';
import './dashboard.scss';

export default class Dashboard extends React.Component {
  render() {
    return (<section className="kdt dashboard">
      <header>
        <div className="title">
          Projects
        </div>
        <Button bsStyle="primary"><AddBoxIcon />New Project...</Button>
      </header>
      <ProjectList />
    </section>);
  }
}
