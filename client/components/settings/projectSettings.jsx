import React from 'react';
import { connect } from 'react-redux';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';
import WorkflowList from '../workflow/workflowList.jsx';
import './settings.scss';

class ProjectSettings extends React.Component {
  constructor() {
    super();
    this.state = { selected: 3 };
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
          <section className="kdt settings-tab-pane">
            Project info goes here.
          </section>
        </Tab>
        <Tab eventKey={2} title="Issue Templates">
          <section className="kdt settings-tab-pane issue-template-edit">
            Issue templates go here.
          </section>
        </Tab>
        <Tab eventKey={3} title="Workflow">
          <section className="kdt settings-tab-pane workflow-edit">
            <WorkflowList {...this.props} />
            <section className="workflow-diagram">
              Workflow diagram goes here.
            </section>
          </section>
        </Tab>
      </Tabs>
    </section>);
  }
}

// ProjectSettings.propTypes = {
//   params: React.PropTypes.shape({
//     project: React.PropTypes.string,
//   }),
// };

export default connect(
  (state, ownProps) => ({
    project: state.projects.byId.get(ownProps.params.project),
    workflow: state.workflows['std/bugtrack'],
  }),
  null,
)(ProjectSettings);
