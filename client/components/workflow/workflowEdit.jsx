import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import WorkflowList from './workflowList.jsx';
import WorkflowDiagram from './workflowDiagram.jsx';
import { editWorkflow, saveWorkflow } from '../../store/workflows';
import './workflow.scss';

class WorkflowEdit extends React.Component {
  constructor() {
    super();
    this.onSave = this.onSave.bind(this);
  }

  componentDidMount() {
    // const workflow = this.props.project.workflow;
    // if (workflow.name !== this.props.name ||
    //     this.props.workflow.project.name !== this.props.project.name) {
    //   this.props.editWorkflow(this.props.workflow);
    // }
  }

  onSave(e) {
    e.preventDefault();
    // this.props.saveWorkflow(this.props.project.name, this.props.name);
  }

  render() {
    const { name, project } = this.props;
    if (project) {
      return <section className="settings-tab-pane" />;
    }
    return (
      <section className="settings-tab-pane">
        <header>
          <span className="title">Workflow: {project.name}/{name}</span>
          <Button bsStyle="primary" disabled={!this.props.modified} onClick={this.onSave}>
            Save
          </Button>
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
  project: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    workflow: React.PropTypes.shape({}),
  }).isRequired,
  modified: React.PropTypes.bool,
  editWorkflow: React.PropTypes.func.isRequired,
  saveWorkflow: React.PropTypes.func.isRequired,
};

export default connect(
  (state) => ({
    name: state.workflows.$name,
    modified: state.workflows.$modified,
    // project: state.workflows.$project,
  }),
  dispatch => bindActionCreators({ editWorkflow, saveWorkflow }, dispatch),
)(WorkflowEdit);
