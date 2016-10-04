import React from 'react';
import { connect } from 'react-redux';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';
import ProjectInfoEdit from '../projects/projectInfoEdit.jsx';
import WorkflowEdit from '../workflow/workflowEdit.jsx';
import './settings.scss';

class ProjectSettings extends React.Component {
  constructor(props, context) {
    super(props, context);
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
          <ProjectInfoEdit {...this.props} />
        </Tab>
        <Tab eventKey={2} title="Issue Templates">
          <section className="kdt settings-tab-pane issue-template-edit">
            Issue templates go here.
          </section>
        </Tab>
        <Tab eventKey={3} title="Workflow">
          <WorkflowEdit {...this.props} />
        </Tab>
      </Tabs>
    </section>);
  }
}

export default connect(
  (state, ownProps) => ({
    project: state.projects.byId.get(ownProps.params.project),
    workflow: state.workflows['std/bugtrack'],
    editWorkflow: state.workflows.$edit,
  }),
  null,
)(ProjectSettings);
