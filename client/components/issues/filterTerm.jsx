import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import CloseIcon from 'icons/ic_close_black_24px.svg';
import EditOperand from './editOperand.jsx';

const FIELD_TYPES = new Immutable.OrderedMap({
  state: {
    caption: 'State',
    type: 'stateSet',
  },
  type: {
    caption: 'Type',
    type: 'typeSet',
  },
  summary: {
    caption: 'Summary',
    type: 'searchText',
  },
  description: {
    caption: 'Description',
    type: 'searchText',
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

  defaultValueForType(fieldInfo) {
    const { project } = this.props;
    if (fieldInfo.type === 'issueState') {
      return new Immutable.Set(project.workflow.states.filter(st => st.open).map(st => st.id));
    } else if (fieldInfo.type === 'issueType') {
      return new Immutable.Set(project.template.types.map(t => t.id));
    } else {
      return '';
    }
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

  render() {
    const { index, term, project, onChange } = this.props;
    const items = [];
    FIELD_TYPES.forEach((ft, id) => {
      items.push(<MenuItem eventKey={id} key={id}>{ft.caption}</MenuItem>);
    });
    const fieldInfo = (term && term.field && FIELD_TYPES.get(term.field));
    const caption = (fieldInfo && fieldInfo.caption) || 'Search by...';

    return (<section className="filter-term">
      <DropdownButton
          bsSize="small"
          title={caption}
          id="term-field"
          onSelect={this.onSelectField}>
        {items}
      </DropdownButton>
      {this.renderOpSelector(fieldInfo)}
      {fieldInfo && (<EditOperand
          type={fieldInfo.type}
          value={term.value}
          project={project}
          onChange={onChange} />)}
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
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    template: PropTypes.shape({
      types: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    workflow: PropTypes.shape({
      states: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};
