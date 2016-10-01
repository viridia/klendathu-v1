import React from 'react';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';
import CreateProjectPanel from './createProjectPanel.jsx';
import ProjectList from './projectList.jsx';
import './profile.scss';

export default class ProfilePage extends React.Component {
  constructor() {
    super();
    this.state = { selected: 1 };
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(selected) {
    this.setState({ selected });
  }

  render() {
    return (<section className="kdt project-settings">
      <header>Profile</header>
      <Tabs
          activeKey={this.state.selected}
          onSelect={this.handleSelect}
          id="project-panel"
          animation={false}>
        <Tab eventKey={1} title="Projects">
          <div className="kdt settings-tab-pane">
            <ProjectList {...this.props} />
            <CreateProjectPanel {...this.props} />
          </div>
        </Tab>
        <Tab eventKey={2} title="Organizations">
          <div className="kdt settings-tab-pane">
            Issue templates go here.
          </div>
        </Tab>
      </Tabs>
    </section>);
  }
}
