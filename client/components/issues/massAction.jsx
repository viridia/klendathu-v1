import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import CloseIcon from 'icons/ic_close_black_24px.svg';
import EditOperand from './editOperand.jsx';

const ACTION_TYPES = new Immutable.OrderedMap({
  addLabel: {
    caption: 'Add Label',
    type: 'label',
  },
  removeLabel: {
    caption: 'Remove Label',
    type: 'label',
  },
  state: {
    caption: 'Change State',
    type: 'state',
  },
  owner: {
    caption: 'Change Owner',
    type: 'user',
  },
  addCC: {
    caption: 'Add CC',
    type: 'users',
  },
  removeCC: {
    caption: 'Remove CC',
    type: 'users',
  },
  deleteIssue: {
    caption: 'Delete',
    action: 'delete',
  },
});

export default class MassAction extends React.Component {
  constructor() {
    super();
    this.onSelectActionType = this.onSelectActionType.bind(this);
    this.onChangeValue = this.onChangeValue.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  onSelectActionType(id) {
    const { index, action } = this.props;
    this.props.onChange(index, { ...action, value: null, id });
  }

  onChangeValue(value) {
    const { index, action } = this.props;
    this.props.onChange(index, { ...action, value });
  }

  onRemove(e) {
    e.preventDefault();
    this.props.onRemove(this.props.index);
  }

  renderOpValue() {
    return null;
  }

  render() {
    const { index, action, project } = this.props;
    const items = [];
    ACTION_TYPES.forEach((at, id) => {
      items.push(<MenuItem eventKey={id} key={id}>{at.caption}</MenuItem>);
    });
    const actionInfo = (action && action.id && ACTION_TYPES.get(action.id));
    const caption = (actionInfo && actionInfo.caption) || 'Choose action...';

    return (<section className="mass-action">
      <DropdownButton
          bsSize="small"
          title={caption}
          id="action-id"
          onSelect={this.onSelectActionType}>
        {items}
      </DropdownButton>
      {actionInfo && (<EditOperand
          type={actionInfo.type}
          value={action.value}
          project={project}
          onChange={this.onChangeValue} />)}
      <div className="flex" />
      {index !== undefined &&
        <button className="remove" onClick={this.onRemove}><CloseIcon /></button>}
    </section>);
  }
}

MassAction.propTypes = {
  index: PropTypes.number,
  action: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.any,
  }),
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
