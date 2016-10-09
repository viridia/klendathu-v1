import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Modal from 'react-bootstrap/lib/Modal';
import classNames from 'classnames';
import LABEL_COLORS from '../common/labelColors';
import './labelSelector.scss';
import '../common/ac/chip.scss';

class LabelDialog extends React.Component {
  constructor() {
    super();
    this.onChangeLabelText = this.onChangeLabelText.bind(this);
    this.onChangeLabelColor = this.onChangeLabelColor.bind(this);
    this.onCreateLabel = this.onCreateLabel.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.state = {
      labelText: '',
      labelColor: '#BA68C8',
    };
  }

  onChangeLabelText(e) {
    this.setState({ labelText: e.target.value });
  }

  onChangeLabelColor(e) {
    this.setState({ labelColor: e.target.dataset.color });
  }

  onKeyDown(e) {
    if (e.keyCode === 13 && this.state.labelText.length >= 3) { // RETURN
      e.preventDefault();
      e.stopPropagation();
      this.onCreateLabel();
    }
  }

  onCreateLabel() {
    console.log('create');
    this.props.onHide();
  }

  render() {
    return (
      <Modal
          show
          onHide={this.props.onHide}
          dialogClassName="create-label">
        <Modal.Header closeButton>
          <Modal.Title>Create Label</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup controlId="name">
            <ControlLabel>Label text</ControlLabel>
            <FormControl
                type="text"
                value={this.state.labelText}
                placeholder="Text for this label"
                autoFocus
                maxLength={64}
                onChange={this.onChangeLabelText}
                onKeyDown={this.onKeyDown} />
            <FormControl.Feedback />
          </FormGroup>
          <FormGroup controlId="color">
            <ControlLabel>Label color</ControlLabel>
            <div className="color-table">
              {LABEL_COLORS.map((row, index) => (
                <div className="color-column" key={index}>
                  {row.map(color =>
                    <button
                        className={classNames('color-selector',
                          { selected: color === this.state.labelColor })}
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
                style={{ backgroundColor: this.state.labelColor }}>
              <span className="title">{this.state.labelText || '???'}</span>
            </div>
          </FormGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.onHide}>Cancel</Button>
          <Button
              onClick={this.onCreateLabel}
              disabled={this.state.labelText.length < 3}
              bsStyle="primary">Create</Button>
        </Modal.Footer>
      </Modal>);
  }
}

LabelDialog.propTypes = {
  project: React.PropTypes.shape({
    labels: React.PropTypes.arrayOf(React.PropTypes.shape({}).isRequired),
  }).isRequired,
  onHide: React.PropTypes.func.isRequired,
};

export default connect(
  null,
  dispatch => bindActionCreators({
  }, dispatch)
)(LabelDialog);
