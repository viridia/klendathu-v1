import React, { PropTypes } from 'react';
import dateFormat from 'dateformat';
import humanAge from '../../lib/humanAge';

export default function RelativeDate({ date, brief = false }) {
  return (
    <span className="date" title={dateFormat(date, 'mmm dS, yyyy h:MM TT')}>
      {humanAge(date, brief)}
    </span>
  );
}

RelativeDate.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  brief: PropTypes.bool,
};
