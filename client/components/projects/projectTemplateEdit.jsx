import React from 'react';
import Button from 'react-bootstrap/lib/Button';
// import ControlLabel from 'react-bootstrap/lib/ControlLabel';
// import FormControl from 'react-bootstrap/lib/FormControl';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { saveProject, updateProject } from '../../store/projects';

class ProjectTemplateEdit extends React.Component {
  constructor(props) {
    super(props);
    // this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onSave = this.onSave.bind(this);
    this.state = {
      // description: props.project.description,
    };
  }

  // onChangeDescription(e) {
  //   this.setState({ description: e.target.value });
  // }

  onSave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.updateProject(this.props.project.name, {
      // description: this.state.description,
    });
    this.props.saveProject(this.props.project.name);
  }

  render() {
    const { project } = this.props;
    const modified = project.description !== this.state.description;
    return (
      <section className="settings-tab-pane">
        <header>
          <span className="title">Issue templates for {project.name}</span>
          <Button bsStyle="primary" disabled={!modified} onClick={this.onSave}>
            Save
          </Button>
        </header>
        <section className="columns">
          <div className="Issue types" />
          <div className="Template Properties" />
        </section>
      </section>
    );
  }
}

ProjectTemplateEdit.propTypes = {
  project: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    description: React.PropTypes.string.isRequired,
  }),
  saveProject: React.PropTypes.func.isRequired,
  updateProject: React.PropTypes.func.isRequired,
};

export default connect(
  (state, ownProps) => ({
    project: state.projects.byId.get(ownProps.params.project),
  }),
  dispatch => bindActionCreators({ saveProject, updateProject }, dispatch),
)(ProjectTemplateEdit);
