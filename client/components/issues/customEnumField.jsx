import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { setCustomField } from '../../store/issues';
import './issues.scss';

class CustomEnumField extends React.Component {
  constructor() {
    super();
    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(value) {
    this.props.setCustomField(this.props.field.id, value);
  }

  render() {
    const { issue, field } = this.props;
    const value = (issue.custom && issue.custom.get(field.id)) || field.default;
    return (<DropdownButton
        bsSize="small"
        title={value}
        id={`field_${field.id}`}
        onSelect={this.onSelect}>
      {this.props.field.values.map(v =>
        <MenuItem key={v} eventKey={v} active={v === value}>{v}</MenuItem>)}
    </DropdownButton>);
  }
}

CustomEnumField.propTypes = {
  field: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    values: React.PropTypes.arrayOf(React.PropTypes.string.isRequired).isRequired,
    default: React.PropTypes.string.isRequired,
  }).isRequired,
  issue: React.PropTypes.shape({}),
  setCustomField: React.PropTypes.func.isRequired,
};

export default connect(
  (state) => ({
    issue: state.issues.$edit,
  }),
  dispatch => bindActionCreators({ setCustomField }, dispatch)
)(CustomEnumField);
