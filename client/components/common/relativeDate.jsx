import React, { PropTypes } from 'react';
import dateFormat from 'dateformat';
import humanAge from '../../lib/humanAge';

export default function RelativeDate({ date }) {
  return (
    <span className="date" title={dateFormat(date, 'mmm dS, yyyy h:MM TT')}>
      {humanAge(date)}
    </span>
  );
}

RelativeDate.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
};
