import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import AddBoxIcon from 'icons/ic_add_box_black_24px.svg';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createProject } from '../../store/projects';
import './profile.scss';

class CreateProjectPanel extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.onCreate = this.onCreate.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onChangeProjectName = this.onChangeProjectName.bind(this);
    this.state = {
      owner: '',
      projectName: '',
      projectNameError: undefined,
    };
  }

  onCreate(ev) {
    ev.preventDefault();
    const newState = {
      projectNameError: undefined,
    };
    this.props.createProject({
      owner: this.state.owner,
      name: this.state.projectName,
    }).then(_resp => {
      newState.projectName = '';
      newState.owner = '';
      this.setState(newState);
    }, error => {
      if (error.response && error.response.data && error.response.data.err) {
        switch (error.response.data.err) {
          case 'exists':
            newState.projectNameError = 'A project with this name already exists.';
            break;
          case 'too-short':
            newState.projectNameError = 'Project name must be at least 6 characters.';
            break;
          case 'invalid-name':
            newState.projectNameError =
              'Project name may only contain lower-case letters, numbers and hyphens.';
            break;
          default:
            break;
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

  render() {
    const { user } = this.props;
    if (!user) {
      return null;
    }
    return (<div className="create-project-panel">
      <header>Create a new project</header>
      <hr />
      <form className="create-project-form">
        <FormGroup controlId="project_owner">
          <ControlLabel>Owner</ControlLabel>
          <FormControl
              componentClass="select"
              label="Owner"
              value={this.state.owner}
              onChange={this.onChangeOwner}>
            <option value="">{user.username}</option>
            <option value="org">organization</option>
          </FormControl>
        </FormGroup>
        <FormGroup
            controlId="project_name"
            validationState={this.state.projectNameError && 'error'}>
          <ControlLabel>Project Name</ControlLabel>
          <FormControl
              type="text"
              label="Project Name"
              value={this.state.projectName}
              onChange={this.onChangeProjectName} />
        </FormGroup>
        <HelpBlock>{this.state.projectNameError}</HelpBlock>
      </form>
      <Button
          bsStyle="primary"
          onClick={this.onCreate}
          disabled={this.state.projectName.length === 0}>
        <AddBoxIcon />
        New Project
      </Button>
    </div>);
  }
}

CreateProjectPanel.propTypes = {
  user: React.PropTypes.shape({
    // username: React.PropTypes.string,
  }),
  location: React.PropTypes.shape({}).isRequired,
  createProject: React.PropTypes.func.isRequired,
};

export default connect(
  state => ({ user: state.user }),
  dispatch => bindActionCreators({ createProject }, dispatch),
)(CreateProjectPanel);
