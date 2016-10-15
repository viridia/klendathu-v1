import React, { PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import { saveProject } from '../../store/projects';
import UserName from '../common/userName.jsx';
import pick from '../../lib/pick';

export default class ProjectInfoEdit extends React.Component {
  constructor(props) {
    super();
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onSave = this.onSave.bind(this);
    this.state = {
      description: props.project.description,
      title: props.project.title || '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.project.id !== this.props.project.id) {
      const { title, description } = nextProps.project;
      this.setState({ title, description });
    }
  }

  onChangeTitle(e) {
    this.setState({ title: e.target.value });
  }

  onChangeDescription(e) {
    this.setState({ description: e.target.value });
  }

  onSave(e) {
    e.preventDefault();
    e.stopPropagation();
    const state = pick(this.state, ['title', 'description']);
    saveProject(this.props.project.id, state).then(resp => {
      this.setState(pick(resp.data.updateProject, ['title', 'description']));
    });
  }

  render() {
    const { project } = this.props;
    const modified =
        project.title !== this.state.title ||
        project.description !== this.state.description;
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
              <th className="header"><ControlLabel>Title:</ControlLabel></th>
              <td>
                <FormControl
                    className="title"
                    type="text"
                    placeholder="title of the project"
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
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string.isRequired,
    owningUser: PropTypes.string,
    owningOrg: PropTypes.string,
  }),
};
