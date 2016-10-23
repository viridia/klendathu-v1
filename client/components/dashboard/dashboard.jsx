import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import AddBoxIcon from 'icons/ic_add_box_black_24px.svg';
import DashboardNav from './dashboardNav.jsx';
import ProjectList from '../projects/projectList.jsx';
import CreateProjectDialog from '../projects/createProjectDialog.jsx';
import './dashboard.scss';

export default class Dashboard extends React.Component {
  constructor() {
    super();
    this.onOpenCreateDialog = this.onOpenCreateDialog.bind(this);
    this.onCloseCreateDialog = this.onCloseCreateDialog.bind(this);
    this.state = { showCreate: false };
  }

  onOpenCreateDialog(e) {
    e.preventDefault();
    this.setState({ showCreate: true });
  }

  onCloseCreateDialog() {
    this.setState({ showCreate: false });
  }

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
          <Button bsStyle="primary" onClick={this.onOpenCreateDialog}>
            <AddBoxIcon />
            New Project...
          </Button>
        </header>
        <ProjectList />
        {this.state.showCreate && <CreateProjectDialog onHide={this.onCloseCreateDialog} />}
      </section>
    </div>);
  }
}

Dashboard.contextTypes = {
  profile: React.PropTypes.shape({
    username: React.PropTypes.string.isRequired,
  }),
};
