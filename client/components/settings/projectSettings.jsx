import React, { PropTypes } from 'react';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';
import ProjectInfoEdit from '../projects/projectInfoEdit.jsx';
import ProjectMemberList from '../projects/projectMemberList.jsx';
import ProjectTemplateEdit from '../projects/projectTemplateEdit.jsx';
import WorkflowEdit from '../workflow/workflowEdit.jsx';
import { Role } from '../../lib/role';
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
    const { project } = this.props;
    if (!project) {
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
        <Tab eventKey={2} title="Members">
          <ProjectMemberList {...this.props} />
        </Tab>
        {project.role >= Role.MANAGER && (<Tab eventKey={3} title="Issue Templates">
          <ProjectTemplateEdit {...this.props} />
        </Tab>)}
        {project.role >= Role.MANAGER && (<Tab eventKey={4} title="Workflow">
          <WorkflowEdit {...this.props} />
        </Tab>)}
      </Tabs>
    </section>);
  }
}

ProjectSettings.propTypes = {
  project: PropTypes.shape({
    role: PropTypes.number.isRequired,
  }),
};
