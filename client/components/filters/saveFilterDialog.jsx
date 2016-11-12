import React, { PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import Modal from 'react-bootstrap/lib/Modal';
import { toastr } from 'react-redux-toastr';
import AddBoxIcon from 'icons/ic_add_box_black_24px.svg';
import { updateProjectMembership } from '../../store/projectMembership';
import './saveFilterDialog.scss';

export default class SaveFilterDialog extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.onSave = this.onSave.bind(this);
    this.onChangeFilterName = this.onChangeFilterName.bind(this);
    this.state = {
      filterName: '',
      filterNameError: null,
      busy: false,
    };
  }

  onSave(ev) {
    console.log('save');
    ev.preventDefault();
    const { project } = this.props;
    // const newState = {
    //   filterNameError: null,
    //   busy: false,
    // };
    this.setState({ busy: true });
    return updateProjectMembership(project.id, this.context.profile.username, {
      addFilters: [{ name: this.state.filterName, value: this.props.filter }],
    })
    .then(() => {
      this.setState({ busy: false });
      // if (this.props.onAddMember) {
      //   this.props.onAddMember(result.data.updateProjectMembership);
      // }
      this.props.onHide();
    }, error => {
      console.error(error);
      if (error.response && error.response.data && error.response.data.err) {
        toastr.error('Operation failed.', `Server returned '${error.response.data.err}'`);
      } else {
        toastr.error('Operation failed.', error.message);
      }
    });

    // createFilter({
    //   owningUser: this.state.owner,
    //   name: this.state.filterName,
    // }).then(_resp => {
    //   newState.filterName = '';
    //   this.setState(newState);
    //   this.props.onHide();
    // }, error => {
    //   if (error.graphQLErrors) {
    //     for (const e of error.graphQLErrors) {
    //       switch (e.details.error) {
    //         case 'name-exists':
    //           newState.projectNameError = 'A project with this name already exists.';
    //           break;
    //         case 'name-too-short':
    //           newState.projectNameError = 'Project name must be at least 6 characters.';
    //           break;
    //         case 'invalid-name':
    //           newState.projectNameError =
    //             'Project name may only contain lower-case letters, numbers and hyphens.';
    //           break;
    //         default:
    //           if (e.message) {
    //             console.error('Server error:', e.message);
    //           } else {
    //             console.error('Unrecognized error code:', e.message, e.details.error);
    //           }
    //           newState.projectNameError = 'Internal server error.';
    //           break;
    //       }
    //     }
    //   } else {
    //     newState.projectNameError = 'Internal server error.';
    //     console.error('create project error:', error);
    //   }
    //   this.setState(newState);
    // });
  }

  onChangeFilterName(e) {
    this.setState({ filterName: e.target.value });
  }

  render() {
    // const { profile } = this.context;
    return (
      <Modal
          show
          onHide={this.props.onHide}
          dialogClassName="save-filter">
        <Modal.Header closeButton>
          <Modal.Title>Create Filter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="save-filter-form" onSubmit={this.onSave}>
            <FormGroup
                controlId="filter_name"
                validationState={this.state.filterNameError && 'error'}>
              <ControlLabel>Filter Name</ControlLabel>
              <FormControl
                  autoFocus
                  type="text"
                  label="Project Name"
                  value={this.state.filterName}
                  onChange={this.onChangeFilterName} />
            </FormGroup>
            <HelpBlock>{this.state.filterNameError}</HelpBlock>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Cancel</Button>
          <Button
              onClick={this.onSave}
              disabled={this.state.filterName.length === 0 || this.state.busy}
              bsStyle="primary">
            <AddBoxIcon />
            Save
          </Button>
        </Modal.Footer>
      </Modal>);
  }
}

SaveFilterDialog.propTypes = {
  project: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
  }).isRequired,
  filter: PropTypes.string.isRequired,
  onHide: PropTypes.func.isRequired,
};

SaveFilterDialog.contextTypes = {
  profile: PropTypes.shape({}),
};
