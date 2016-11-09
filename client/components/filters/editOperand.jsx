import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import FormControl from 'react-bootstrap/lib/FormControl';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import LabelSelector from '../issues/labelSelector.jsx';
import UserAutoComplete from '../common/userAutoComplete.jsx';
import './editOperand.scss';

export function defaultValueForType(project, type) {
  if (type === 'stateSet') {
    return new Immutable.Set(project.workflow.states.filter(st => !st.closed).map(st => st.id));
  } else if (type === 'typeSet') {
    return new Immutable.Set(project.template.types.map(t => t.id));
  } else if (type === 'label') {
    return [];
  } else if (type === 'user' || type === 'users') {
    return [];
  } else {
    return '';
  }
}

class StateSetEditor extends React.Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    if (e.target.checked) {
      this.props.onChange(this.props.value.add(e.target.dataset.id));
    } else {
      this.props.onChange(this.props.value.remove(e.target.dataset.id));
    }
  }

  render() {
    const { project, value } = this.props;
    return (
      <div className="select-states">
        {project.workflow.states.map(st => (
          <Checkbox key={st.id} data-id={st.id} checked={value.has(st.id)} onChange={this.onChange}>
            {st.caption}
          </Checkbox>))}
      </div>
    );
  }
}

StateSetEditor.propTypes = {
  value: ImmutablePropTypes.set.isRequired,
  project: PropTypes.shape({
    workflow: PropTypes.shape({
      states: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

class TypeSetEditor extends React.Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    if (e.target.checked) {
      this.props.onChange(this.props.value.add(e.target.dataset.id));
    } else {
      this.props.onChange(this.props.value.remove(e.target.dataset.id));
    }
  }

  render() {
    const { project, value } = this.props;
    return (
      <div className="select-types">
        {project.template.types.map(t => (
          !t.abstract &&
            <Checkbox key={t.id} data-id={t.id} checked={value.has(t.id)} onChange={this.onChange}>
              {t.caption}
            </Checkbox>))}
      </div>
    );
  }
}

TypeSetEditor.propTypes = {
  value: ImmutablePropTypes.set.isRequired,
  project: PropTypes.shape({
    template: PropTypes.shape({
      types: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

/** Component which allows the user to enter a value for the filter and mass edit functions. */
export default class EditOperand extends React.Component {
  render() {
    const { type, project, onChange } = this.props;
    if (!type) {
      return null;
    }
    let value = this.props.value;
    if (value === null || value === undefined) {
      value = defaultValueForType(project, type);
    }
    switch (type) {
      case 'searchText':
        return (
          <FormControl
              className="match-text"
              placeholder="text to match"
              value={value}
              onChange={e => onChange(e.target.value)} />
        );
      case 'stateSet': {
        return <StateSetEditor project={project} value={value} onChange={onChange} />;
      }
      case 'typeSet': {
        return <TypeSetEditor project={project} value={value} onChange={onChange} />;
      }
      case 'state': {
        const items = project.workflow.states.map(st => (
          <MenuItem eventKey={st.id} key={st.id}>{st.caption}</MenuItem>
        ));
        const selectedState = project.workflow.statesById.get(value);
        return (
          <DropdownButton
              bsSize="small"
              title={selectedState ? selectedState.caption : 'Choose state...'}
              id="action-id"
              onSelect={this.props.onChange}>
            {items}
          </DropdownButton>);
      }
      case 'type': {
        const items = project.template.types.map(t => (
          !t.abstract && <MenuItem eventKey={t.id} key={t.id}>{t.caption}</MenuItem>
        ));
        const selectedType = project.template.typesById.get(value);
        return (
          <DropdownButton
              bsSize="small"
              title={selectedType ? selectedType.caption : 'Choose type...'}
              id="action-id"
              onSelect={this.props.onChange}>
            {items}
          </DropdownButton>);
      }
      case 'label': {
        return (
          <LabelSelector
              id="labels"
              className="labels inline"
              project={project}
              selection={value}
              onSelectionChange={this.props.onChange} />);
      }
      case 'user': {
        return (
          <UserAutoComplete
              className="user inline"
              project={project}
              placeholder="(none)"
              selection={value}
              onSelectionChange={this.props.onChange} />);
      }
      case 'users': {
        return (
          <UserAutoComplete
              className="user inline"
              project={project}
              placeholder="(none)"
              selection={value}
              multiple
              onSelectionChange={this.props.onChange} />);
      }
      default:
        return null;
    }
  }
}

EditOperand.propTypes = {
  type: PropTypes.string,
  value: PropTypes.any, // eslint-disable-line
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
};
