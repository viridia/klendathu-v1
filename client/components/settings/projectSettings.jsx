import React from 'react';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';
import './settings.scss';

export default class ProjectSettings extends React.Component {
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
      <header>Project settings</header>
      <Tabs
          activeKey={this.state.selected}
          onSelect={this.handleSelect}
          animation={false}
          id="project-panel">
        <Tab eventKey={1} title="Project Info">
          <div className="kdt settings-tab-pane">
            Project info goes here.
          </div>
        </Tab>
        <Tab eventKey={2} title="Issue Templates">
          <div className="kdt settings-tab-pane">
            Issue templates go here.
          </div>
        </Tab>
        <Tab eventKey={3} title="Workflow">
          <div className="kdt settings-tab-pane">
            Workflow diagram goes here.
          </div>
        </Tab>
      </Tabs>
    </section>);
  }
}
