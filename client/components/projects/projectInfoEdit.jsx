import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { saveProject, updateProject } from '../../store/projects';
import UserName from '../common/userName.jsx';

class ProjectInfoEdit extends React.Component {
  constructor(props) {
    super();
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onSave = this.onSave.bind(this);
    this.state = {
      description: props.project.description,
    };
  }

  onChangeDescription(e) {
    this.setState({ description: e.target.value });
  }

  onSave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.updateProject(this.props.project.name, {
      description: this.state.description,
    });
    this.props.saveProject(this.props.project.name);
  }

  render() {
    const { project } = this.props;
    const modified = project.description !== this.state.description;
    return (
      <section className="settings-tab-pane">
        <header>
          <span className="title">{project.name}</span>
          <Button bsStyle="primary" disabled={!modified} onClick={this.onSave}>
            Save
          </Button>
        </header>
        <table className="form-table">
          <tbody>
            <tr>
              <th className="header"><ControlLabel>Description:</ControlLabel></th>
              <td>
                <FormControl
                    className="description"
                    type="text"
                    placeholder="description of the project"
                    value={this.state.description}
                    onChange={this.onChangeDescription} />
              </td>
            </tr>
            <tr>
              <th className="header"><ControlLabel>Owner:</ControlLabel></th>
              <td className="owner single-static">
                <UserName user={project.owningUser} />
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    );
  }
}

ProjectInfoEdit.propTypes = {
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
)(ProjectInfoEdit);
