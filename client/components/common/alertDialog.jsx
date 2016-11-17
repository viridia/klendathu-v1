import React, { PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import './alertDialog.scss';

export default function AlertDialog({ title, children, primaryText, onHide }) {
  return (
    <Modal show onHide={onHide} dialogClassName="alert-dialog">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide} bsStyle="primary">{primaryText}</Button>
      </Modal.Footer>
    </Modal>);
}

AlertDialog.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  primaryText: PropTypes.string.isRequired,
  onHide: PropTypes.func.isRequired,
};
