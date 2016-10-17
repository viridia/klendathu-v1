import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import Modal from 'react-bootstrap/lib/Modal';
import AddBoxIcon from 'icons/ic_add_box_black_24px.svg';
import { createProject } from '../../store/projects';
import './createProjectDialog.scss';

export default class CreateProjectDialog extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.onCreate = this.onCreate.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onChangeProjectName = this.onChangeProjectName.bind(this);
    this.onChangeProjectTitle = this.onChangeProjectTitle.bind(this);
    this.state = {
      owner: '',
      projectName: '',
      projectNameError: null,
      projectTitle: '',
      projectTitleError: null,
      busy: false,
    };
  }

  onCreate(ev) {
    ev.preventDefault();
    const newState = {
      projectNameError: null,
      projectTitleError: null,
      busy: false,
    };
    this.setState({ busy: true });
    createProject({
      owningUser: this.state.owner,
      name: this.state.projectName,
      title: this.state.projectTitle,
    }).then(_resp => {
      newState.projectName = '';
      newState.projectTitle = '';
      newState.owner = '';
      this.setState(newState);
    }, error => {
      if (error.graphQLErrors) {
        for (const e of error.graphQLErrors) {
          switch (e.details.error) {
            case 'name-exists':
              newState.projectNameError = 'A project with this name already exists.';
              break;
            case 'name-too-short':
              newState.projectNameError = 'Project name must be at least 6 characters.';
              break;
            case 'invalid-name':
              newState.projectNameError =
                'Project name may only contain lower-case letters, numbers and hyphens.';
              break;
            default:
              if (e.message) {
                console.error('Server error:', e.message);
              } else {
                console.error('Unrecognized error code:', e.message, e.details.error);
              }
              newState.projectNameError = 'Internal server error.';
              break;
          }
        }
      } else {
        newState.projectNameError = 'Internal server error.';
        console.error('create project error:', error);
      }
      this.setState(newState);
    });
  }

  onChangeOwner(e) {
    this.setState({ owner: e.target.value });
  }

  onChangeProjectName(e) {
    this.setState({ projectName: e.target.value });
  }

  onChangeProjectTitle(e) {
    this.setState({ projectTitle: e.target.value });
  }

  render() {
    const { profile } = this.context;
    return (
      <Modal
          show
          onHide={this.props.onHide}
          dialogClassName="create-label">
        <Modal.Header closeButton>
          <Modal.Title>Create Label</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="create-project-form">
            <FormGroup
                controlId="project_name"
                validationState={this.state.projectNameError && 'error'}>
              <ControlLabel>Project Id</ControlLabel>
              <FormControl
                  type="text"
                  label="Project Name"
                  value={this.state.projectName}
                  onChange={this.onChangeProjectName} />
            </FormGroup>
            <HelpBlock>{this.state.projectNameError}</HelpBlock>
            <FormGroup
                controlId="project_title"
                validationState={this.state.projectTitleError && 'error'}>
              <ControlLabel>Project Title</ControlLabel>
              <FormControl
                  type="text"
                  label="Project Title"
                  value={this.state.projectTitle}
                  onChange={this.onChangeProjectTitle} />
            </FormGroup>
            <HelpBlock>{this.state.projectTitleError}</HelpBlock>
            <FormGroup controlId="project_owner">
              <ControlLabel>Owner</ControlLabel>
              <FormControl
                  componentClass="select"
                  label="Owner"
                  value={this.state.owner}
                  onChange={this.onChangeOwner}>
                <option value="">{profile.username}</option>
                <option value="org">organization</option>
              </FormControl>
            </FormGroup>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Cancel</Button>
          <Button
              onClick={this.onCreateProject}
              disabled={this.state.projectName.length === 0 && !this.state.busy}
              bsStyle="primary">
            <AddBoxIcon />
            Create Project
          </Button>
        </Modal.Footer>
      </Modal>);
  }
}

CreateProjectDialog.propTypes = {
  onHide: React.PropTypes.func.isRequired,
};

CreateProjectDialog.contextTypes = {
  profile: React.PropTypes.shape({
  }),
};
