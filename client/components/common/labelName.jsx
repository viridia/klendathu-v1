import React, { PropTypes } from 'react';
import { graphql } from 'react-apollo';
import LabelQuery from '../../graphql/queries/label.graphql';
import './labelName.scss';

/** Component that displays a label as a chip. */
class LabelName extends React.Component {
  render() {
    const label = this.props.data.label;
    if (label) {
      return (<span className="label-name" style={{ backgroundColor: label.color }}>
        {label.name}
      </span>);
    } else {
      return <span className="label-name">unknown label</span>;
    }
  }
}

LabelName.propTypes = {
  label: React.PropTypes.number.isRequired,
  project: React.PropTypes.string.isRequired,
  data: PropTypes.shape({
    label: PropTypes.shape({}),
  }),
};

export default graphql(LabelQuery, {
  options: ({ label, project }) => ({ variables: { label, project } }),
})(LabelName);
