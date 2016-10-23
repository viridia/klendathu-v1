import React from 'react';
import Button from 'react-bootstrap/lib/Button';
// import { saveProject } from '../../store/projects';

export default class ProjectTemplateEdit extends React.Component {
  constructor(props) {
    super(props);
    // this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onSave = this.onSave.bind(this);
    this.state = {};
  }

  onSave(e) {
    e.preventDefault();
    e.stopPropagation();
    console.error('save project here.');
    // this.props.updateProject(this.props.project.name, {
    //   // description: this.state.description,
    // });
    // saveProject(this.props.project.name);
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
  }).isRequired,
};
