import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import CloseIcon from 'icons/ic_close_black_24px.svg';
import EditOperand, { defaultValueForType } from './editOperand.jsx';

function append(issue, updates, fieldName, values) {
  const before = new Immutable.OrderedSet(issue[fieldName]);
  const after = before.union(values);
  if (before !== after) {
    updates[fieldName] = after.toArray();
    return true;
  }
  return false;
}

function remove(issue, updates, fieldName, values) {
  const before = new Immutable.OrderedSet(issue[fieldName]);
  const after = before.subtract(values);
  if (before !== after) {
    updates[fieldName] = after.toArray();
    return true;
  }
  return false;
}

const ACTION_TYPES = new Immutable.OrderedMap({
  addLabel: {
    caption: 'Add Label',
    type: 'label',
    apply: (issue, update, value) => {
      return append(issue, update, 'labels', value.map(v => v.id));
    },
  },
  removeLabel: {
    caption: 'Remove Label',
    type: 'label',
    apply: (issue, update, value) => {
      return remove(issue, update, 'labels', value.map(v => v.id));
    },
  },
  state: {
    caption: 'Change State',
    type: 'state',
    apply: (issue, update, value) => {
      if (issue.state !== value) {
        update.state = value;
        return true;
      }
      return false;
    },
  },
  type: {
    caption: 'Change Type',
    type: 'type',
    apply: (issue, update, value) => {
      if (issue.type !== value) {
        update.type = value;
        return true;
      }
      return false;
    },
  },
  owner: {
    caption: 'Change Owner',
    type: 'user',
    apply: (issue, update, value) => {
      const user = value ? value.username : null;
      if (issue.owner !== user) {
        update.owner = user;
        return true;
      }
      return false;
    },
  },
  addCC: {
    caption: 'Add CC',
    type: 'users',
    apply: (issue, update, value) => {
      return append(issue, update, 'cc', value.map(user => user.username));
    },
  },
  removeCC: {
    caption: 'Remove CC',
    type: 'users',
    apply: (issue, update, value) => {
      return remove(issue, update, 'cc', value.map(user => user.username));
    },
  },
  delete: {
    caption: 'Delete',
    action: 'delete',
    apply: () => {},
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
    const { index, action, project } = this.props;
    const newAction = ACTION_TYPES.get(id);
    if (!action || newAction.type !== action.type) {
      this.props.onChange(index, {
        ...newAction,
        value: defaultValueForType(project, newAction.type, newAction.customField),
        id,
      });
    } else {
      this.props.onChange(index, { ...newAction, value: action.value, id });
    }
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
    const caption = (action && action.caption) || 'Choose action...';

    return (<section className="mass-action">
      <DropdownButton
          bsSize="small"
          title={caption}
          id="action-id"
          onSelect={this.onSelectActionType}>
        {items}
      </DropdownButton>
      <section className="action-operand">
        {action && (<EditOperand
            type={action.type}
            value={action.value}
            project={project}
            onChange={this.onChangeValue} />)}
      </section>
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
