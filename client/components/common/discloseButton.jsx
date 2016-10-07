import React from 'react';
import DiscloseIcon from 'icons/ic_play_arrow_black_24px.svg';
import classNames from 'classnames';
import './discloseButton.scss';

export default function DiscloseButton(props) {
  return (
    <button className={classNames('disclose', { checked: props.checked })} onClick={props.onClick}>
      <DiscloseIcon className="svg-icon" />
    </button>
  );
}

DiscloseButton.propTypes = {
  onClick: React.PropTypes.func.isRequired,
  checked: React.PropTypes.bool.isRequired,
};
