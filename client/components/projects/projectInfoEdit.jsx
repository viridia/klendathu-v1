import React, { PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import { Role } from '../../lib/role';
import { updateProject } from '../../store/projects';

export default class ProjectInfoEdit extends React.Component {
  constructor(props) {
    super();
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangePublic = this.onChangePublic.bind(this);
    this.onSave = this.onSave.bind(this);
    this.state = {
      description: props.project.description,
      title: props.project.title || '',
      public: props.project.public,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.project.id !== this.props.project.id) {
      const { title, description } = nextProps.project;
      this.setState({ title, description, public: !!nextProps.project.public });
    }
  }

  onChangeTitle(e) {
    this.setState({ title: e.target.value });
  }

  onChangeDescription(e) {
    this.setState({ description: e.target.value });
  }

  onChangePublic(e) {
    this.setState({ public: e.target.checked });
  }

  onSave(e) {
    e.preventDefault();
    e.stopPropagation();
    const { title, description } = this.state;
    updateProject(this.props.project.id, { title, description, public: this.state.public });
  }

  render() {
    const { project } = this.props;
    const modified =
        project.title !== this.state.title ||
        project.description !== this.state.description ||
        project.public !== this.state.public;
    return (
      <section className="settings-tab-pane">
        <header>
          <span className="title">{project.name}</span>
          <Button
              bsStyle="primary"
              disabled={!modified || project.role < Role.MANAGER}
              onClick={this.onSave}>
            Save
          </Button>
        </header>
        <table className="form-table">
          <tbody>
            <tr>
              <th className="header"><ControlLabel>Title:</ControlLabel></th>
              <td>
                <FormControl
                    className="title"
                    type="text"
                    placeholder="title of the project"
                    disabled={project.role < Role.MANAGER}
                    value={this.state.title}
                    onChange={this.onChangeTitle} />
              </td>
            </tr>
            <tr>
              <th className="header"><ControlLabel>Description:</ControlLabel></th>
              <td>
                <FormControl
                    className="description"
                    type="text"
                    placeholder="description of the project"
                    disabled={project.role < Role.MANAGER}
                    value={this.state.description}
                    onChange={this.onChangeDescription} />
              </td>
            </tr>
            <tr>
              <th />
              <td>
                <Checkbox
                    checked={this.state.public} onChange={this.onChangePublic}
                    disabled={project.role < Role.MANAGER}>
                  Public
                </Checkbox>
              </td>
            </tr>
            <tr>
              <th className="header"><ControlLabel>Owner:</ControlLabel></th>
              <td className="owner single-static">
                {project.owningUser}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    );
  }
}

ProjectInfoEdit.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.number.isRequired,
    title: PropTypes.string,
    description: PropTypes.string.isRequired,
    owningUser: PropTypes.string,
    owningOrg: PropTypes.string,
    public: PropTypes.bool,
  }),
};
