import React, { PropTypes } from 'react';
import { withApollo } from 'react-apollo';
import Button from 'react-bootstrap/lib/Button';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Modal from 'react-bootstrap/lib/Modal';
import classNames from 'classnames';
import { toastr } from 'react-redux-toastr';
import { createLabel, updateLabel } from '../../store/label';
import { updateProjectMembership } from '../../store/projectMembership';
import LABEL_COLORS from '../common/labelColors';
import './labelDialog.scss';
import '../common/ac/chip.scss';

class LabelDialog extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeLabelText = this.onChangeLabelText.bind(this);
    this.onChangeLabelColor = this.onChangeLabelColor.bind(this);
    this.onChangeVisible = this.onChangeVisible.bind(this);
    this.onUpdateLabel = this.onUpdateLabel.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    if (props.label) {
      this.state = {
        name: props.label.name,
        color: props.label.color,
        visible: props.visible,
        busy: false,
      };
    } else {
      this.state = {
        name: '',
        color: '#e679f8',
        busy: false,
        visible: false,
      };
    }
  }

  onChangeLabelText(e) {
    this.setState({ name: e.target.value });
  }

  onChangeVisible(e) {
    this.setState({ visible: e.target.checked });
  }

  onChangeLabelColor(e) {
    this.setState({ color: e.target.dataset.color });
  }

  onKeyDown(e) {
    if (e.keyCode === 13 && this.state.name.length >= 3) { // RETURN
      e.preventDefault();
      e.stopPropagation();
      this.onUpdateLabel();
    }
  }

  onUpdateLabel() {
    const { label, project } = this.props;
    const { name, color, visible } = this.state;
    this.setState({ busy: true });
    let result;
    if (label) {
      result = updateLabel(this.props.project.id, label.id, { name, color });
    } else {
      result = createLabel(this.props.project.id, { name, color });
    }

    result.then(resp => {
      if (label.visible !== visible) {
        const update = {};
        if (visible) {
          update.addLabels = [label.id];
        } else {
          update.removeLabels = [label.id];
        }

        updateProjectMembership(project.id, this.context.profile.username, update).then(() => {
          this.props.onInsertLabel(resp.data.newLabel);
          this.setState({ busy: false });
          this.props.onHide();
        });
      } else {
        this.props.onInsertLabel(resp.data.newLabel);
        this.setState({ busy: false });
        this.props.onHide();
      }
    }, error => {
      console.error(error);
      if (error.response && error.response.data && error.response.data.err) {
        switch (error.response.data.err) {
          case 'no-project':
            toastr.error('Operation failed.', 'Invalid project id');
            break;
          default:
            toastr.error('Operation failed.', `Server returned '${error.response.data.err}'`);
            console.error('response:', error.response);
            break;
        }
      } else {
        toastr.error('Operation failed.', error.message);
      }
      this.setState({ busy: false });
      this.props.onHide();
    });
  }

  render() {
    const { label } = this.props;
    return (
      <Modal
          show
          onHide={this.props.onHide}
          dialogClassName="create-label">
        <Modal.Header closeButton>
          {label
              ? <Modal.Title>Edit Label</Modal.Title>
              : <Modal.Title>Create Label</Modal.Title>}
        </Modal.Header>
        <Modal.Body>
          <FormGroup controlId="name">
            <ControlLabel>Label text</ControlLabel>
            <FormControl
                type="text"
                value={this.state.name}
                placeholder="Text for this label"
                autoFocus
                maxLength={64}
                onChange={this.onChangeLabelText}
                onKeyDown={this.onKeyDown} />
            <FormControl.Feedback />
          </FormGroup>
          <FormGroup controlId="visible">
            <Checkbox checked={this.state.visible} onChange={this.onChangeVisible}>
              Show in hotlist
            </Checkbox>
          </FormGroup>
          <FormGroup controlId="color">
            <ControlLabel>Label color</ControlLabel>
            <div className="color-table">
              {LABEL_COLORS.map((row, index) => (
                <div className="color-column" key={index}>
                  {row.map(color =>
                    <button
                        className={classNames('color-selector',
                          { selected: color === this.state.color })}
                        key={color}
                        data-color={color}
                        style={{ backgroundColor: color }}
                        onClick={this.onChangeLabelColor} >A</button>)}
                </div>))}
            </div>
          </FormGroup>
          <FormGroup controlId="preview">
            <ControlLabel>Label preview:</ControlLabel>
            <div
                className="label-preview chip"
                style={{ backgroundColor: this.state.color }}>
              <span className="title">{this.state.name || '???'}</span>
            </div>
          </FormGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Cancel</Button>
          <Button
              onClick={this.onUpdateLabel}
              disabled={this.state.name.length < 3 || this.state.busy}
              bsStyle="primary">{label ? 'Save' : 'Create'}</Button>
        </Modal.Footer>
      </Modal>);
  }
}

LabelDialog.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  label: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    visible: PropTypes.bool,
  }),
  onHide: PropTypes.func.isRequired,
  onInsertLabel: PropTypes.func.isRequired,
  visible: PropTypes.bool,
};

LabelDialog.contextTypes = {
  profile: PropTypes.shape({}),
};

export default withApollo(LabelDialog);
