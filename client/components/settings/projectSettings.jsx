import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';
import ProjectInfoEdit from '../projects/projectInfoEdit.jsx';
import ProjectMemberList from '../projects/projectMemberList.jsx';
import ProjectTemplateEdit from '../projects/projectTemplateEdit.jsx';
import WorkflowEdit from '../workflow/workflowEdit.jsx';
import ColumnSettings from './columnSettings.jsx';
import { Role } from '../../lib/role';
import './settings.scss';

export default class ProjectSettings extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(selected) {
    browserHistory.push({ pathname: `/project/${this.props.project.name}/settings/${selected}` });
  }

  render() {
    const { project, params } = this.props;
    if (!project) {
      return <section className="kdt project-settings" />;
    }
    const activeKey = params.tab || 'info';
    return (<section className="kdt project-settings">
      <header>Project settings</header>
      <Tabs
          activeKey={activeKey}
          onSelect={this.handleSelect}
          animation={false}
          id="project-panel">
        <Tab eventKey="info" title="Project Info">
          <ProjectInfoEdit {...this.props} />
        </Tab>
        <Tab eventKey="columns" title="Columns">
          <ColumnSettings {...this.props} />
        </Tab>
        <Tab eventKey="members" title="Members">
          <ProjectMemberList {...this.props} />
        </Tab>
        {project.role >= Role.MANAGER && (<Tab eventKey="templates" title="Issue Templates">
          <ProjectTemplateEdit {...this.props} />
        </Tab>)}
        {project.role >= Role.MANAGER && (<Tab eventKey="workflow" title="Workflow">
          <WorkflowEdit {...this.props} />
        </Tab>)}
      </Tabs>
    </section>);
  }
}

ProjectSettings.propTypes = {
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    role: PropTypes.number.isRequired,
  }),
  params: PropTypes.shape({
    tab: PropTypes.string,
  }).isRequired,
};
