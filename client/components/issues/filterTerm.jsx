import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import FormControl from 'react-bootstrap/lib/FormControl';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import CloseIcon from 'icons/ic_close_black_24px.svg';

const FIELD_TYPES = new Immutable.OrderedMap({
  state: {
    caption: 'State',
    type: 'issueState',
  },
  type: {
    caption: 'Type',
    type: 'issueType',
  },
  summary: {
    caption: 'Summary',
    type: 'text',
  },
  description: {
    caption: 'Description',
    type: 'text',
  },
  reporter: {
    caption: 'Reporter',
    type: 'user',
  },
  owner: {
    caption: 'Owner',
    type: 'user',
  },
  cc: {
    caption: 'CC',
    type: 'user[]',
  },
  labels: {
    caption: 'Labels',
    type: 'label[]',
  },
  keywords: {
    caption: 'Keywords',
    type: 'text[]',
  },
});
// custom fields (hardware, etc)
// comments / commenter
// linked
// created
// updated

/** Class which edits a single term of a filter expression. */
export default class FilterTerm extends React.Component {
  constructor() {
    super();
    this.onSelectField = this.onSelectField.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  onSelectField(field) {
    const { index, term } = this.props;
    this.props.onChange(index, { ...term, field });
  }

  onRemove(e) {
    e.preventDefault();
    this.props.onRemove(this.props.index);
  }

  renderOpSelector(fieldInfo) {
    if (!fieldInfo) {
      return null;
    }
    switch (fieldInfo.type) {
      case 'text':
        return (
          <DropdownButton
              bsSize="small"
              title="contains"
              id="term-field"
              onSelect={this.onSelectField}>
            <MenuItem eventKey="contains">contains</MenuItem>
            <MenuItem eventKey="matches">is exactly</MenuItem>
            <MenuItem eventKey="not-contains">does not contain</MenuItem>
            <MenuItem eventKey="not-matches">is not exactly</MenuItem>
          </DropdownButton>
        );
      default:
        return null;
    }
  }

  renderOpValue(fieldInfo) {
    if (!fieldInfo) {
      return null;
    }
    switch (fieldInfo.type) {
      case 'text':
        return (
          <FormControl
              className="match-text"
              placeholder="text to match"
              value={this.props.term.value}
              onChange={this.onChangeValue} />
        );
      default:
        return null;
    }
  }

  render() {
    const { index, term } = this.props;
    const items = [];
    FIELD_TYPES.forEach((ft, id) => {
      items.push(<MenuItem eventKey={id} key={id}>{ft.caption}</MenuItem>);
    });
    const fieldInfo = (term && term.field && FIELD_TYPES.get(term.field));
    const caption = (fieldInfo && fieldInfo.caption) || 'Set filter term...';

    return (<section className="filter-term">
      <DropdownButton
          bsSize="small"
          title={caption}
          id="term-field"
          onSelect={this.onSelectField}>
        {items}
      </DropdownButton>
      {this.renderOpSelector(fieldInfo)}
      {this.renderOpValue(fieldInfo)}
      <div className="flex" />
      {index !== undefined &&
        <button className="remove" onClick={this.onRemove}><CloseIcon /></button>}
    </section>);
  }
}

FilterTerm.propTypes = {
  term: PropTypes.shape({
    field: PropTypes.string.isRequired,
    value: PropTypes.string,
  }),
  index: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};
