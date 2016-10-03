import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import WorkflowList from './workflowList.jsx';
import WorkflowDiagram from './workflowDiagram.jsx';
import { editWorkflow } from '../../store/workflows';
import './workflow.scss';

class WorkflowEdit extends React.Component {
  componentDidMount() {
    if (this.props.workflow.name !== this.props.name ||
        this.props.workflow.project !== this.props.project) {
      this.props.editWorkflow(this.props.workflow);
    }
  }

  render() {
    const { name, project } = this.props;
    return (
      <section className="kdt settings-tab-pane workflow-edit">
        <header className="card internal">
          {name && <span className="title">Workflow: {project}/{name}</span>}
        </header>
        <div className="columns">
          <WorkflowList />
          <WorkflowDiagram />
        </div>
      </section>
    );
  }
}

WorkflowEdit.propTypes = {
  workflow: React.PropTypes.shape({
    name: React.PropTypes.string,
    project: React.PropTypes.string,
  }),
  name: React.PropTypes.string,
  project: React.PropTypes.string,
  editWorkflow: React.PropTypes.func.isRequired,
};

export default connect(
  (state) => ({
    name: state.workflows.$name,
    project: state.workflows.$project,
  }),
  dispatch => bindActionCreators({ editWorkflow }, dispatch),
)(WorkflowEdit);
