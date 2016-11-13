import React, { PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import './confirmDialog.scss';

export default function ConfirmDialog(
    { title, children, confirmText, cancelText, onConfirm, onCancel, busy }) {
  return (
    <Modal show onHide={onCancel} dialogClassName="confirm-dialog">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onCancel}>{cancelText}</Button>
        <Button onClick={onConfirm} disabled={busy} bsStyle="primary">{confirmText}</Button>
      </Modal.Footer>
    </Modal>);
}

ConfirmDialog.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  confirmText: PropTypes.string.isRequired,
  cancelText: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  busy: PropTypes.bool,
};
