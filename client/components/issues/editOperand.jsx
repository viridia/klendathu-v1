import React, { PropTypes } from 'react';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import FormControl from 'react-bootstrap/lib/FormControl';
import './editOperand.scss';

/** Component which allows the user to enter a value for the filter and mass edit functions. */
export default class EditOperand extends React.Component {
  render() {
    const { type, value, project, onChange } = this.props;
    if (!type) {
      return null;
    }
    switch (type) {
      case 'searchText':
        return (
          <FormControl
              className="match-text"
              placeholder="text to match"
              value={value}
              onChange={onChange} />
        );
      case 'stateSet': {
        return (
          <div className="select-states">
            {project.workflow.states.map(st => (
              <Checkbox key={st.id} checked={false} onChange={onChange}>
                {st.caption}
              </Checkbox>))}
          </div>);
      }
      case 'typeSet': {
        return (
          <div className="select-types">
            {project.template.types.map(t => (
              !t.abstract && <Checkbox key={t.id} checked={false} onChange={onChange}>
                {t.caption}
              </Checkbox>))}
          </div>);
      }
      default:
        return null;
    }
  }
}

EditOperand.propTypes = {
  type: PropTypes.string,
  value: PropTypes.oneOf([
    PropTypes.string,
    PropTypes.shape({}),
  ]),
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
