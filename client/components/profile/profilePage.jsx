import React from 'react';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';
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
        <Tab eventKey={1} title="Account">
          <div className="settings-tab-pane">
            Account details.
          </div>
        </Tab>
        <Tab eventKey={2} title="Organizations">
          <div className="settings-tab-pane">
            Organizations.
          </div>
        </Tab>
      </Tabs>
    </section>);
  }
}

ProfilePage.contextTypes = {
  profile: React.PropTypes.shape({
    // username: React.PropTypes.string,
  }),
};
