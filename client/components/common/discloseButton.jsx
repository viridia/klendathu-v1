import React from 'react';
import AddBoxIcon from 'icons/ic_play_arrow_black_24px.svg';
import classNames from 'classnames';
import './discloseButton.scss';

export default function DiscloseButton(props) {
  return (
    <button className={classNames('disclose', { checked: props.checked })} onClick={props.onClick}>
      <AddBoxIcon className="svg-icon" />
    </button>
  );
}

DiscloseButton.propTypes = {
  onClick: React.PropTypes.func.isRequired,
  checked: React.PropTypes.bool.isRequired,
};
