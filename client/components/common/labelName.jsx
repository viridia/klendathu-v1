import React, { PropTypes } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
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
  label: React.PropTypes.string.isRequired,
  data: PropTypes.shape({
    label: PropTypes.shape({}),
  }),
};

const LabelQuery = gql`query LabelQuery($label: ID!) {
  label(id: $label) {
    id
    name
    color
  }
}`;

export default graphql(LabelQuery, {
  options: ({ label }) => ({ variables: { label } }),
})(LabelName);
