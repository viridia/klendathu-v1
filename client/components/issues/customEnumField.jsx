import React from 'react';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

export default class CustomEnumField extends React.Component {
  constructor() {
    super();
    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(value) {
    this.props.onChange(this.props.field.id, value);
  }

  render() {
    const { value, field } = this.props;
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
  value: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired,
};
