import React from 'react';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';
import ProjectInfoEdit from '../projects/projectInfoEdit.jsx';
import ProjectTemplateEdit from '../projects/projectTemplateEdit.jsx';
import WorkflowEdit from '../workflow/workflowEdit.jsx';
import './settings.scss';

export default class ProjectSettings extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { selected: 1 };
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(selected) {
    this.setState({ selected });
  }

  render() {
    if (!this.props.project) {
      return <section className="kdt project-settings" />;
    }
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
          <ProjectTemplateEdit {...this.props} />
        </Tab>
        <Tab eventKey={3} title="Workflow">
          <WorkflowEdit {...this.props} />
        </Tab>
      </Tabs>
    </section>);
  }
}

ProjectSettings.propTypes = {
  project: React.PropTypes.shape({}),
};
