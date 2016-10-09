import React from 'react';
import CloseIcon from 'icons/ic_close_black_24px.svg';
import classNames from 'classnames';
import './chip.scss';

export default function Chip({ children, className, onClose, style }) {
  return (
    <span className={classNames('chip', className)} style={style}>
      {onClose && <CloseIcon className="close" />}
      <span className="title">{children}</span>
    </span>
  );
}

Chip.propTypes = {
  children: React.PropTypes.node,
  className: React.PropTypes.string,
  onClose: React.PropTypes.func,
  style: React.PropTypes.shape({}),
};
