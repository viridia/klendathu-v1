import React from 'react';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Radio from 'react-bootstrap/lib/Radio';

/** Selects the state of the issue. */
export default class StateSelector extends React.Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    e.preventDefault();
  }

  render() {
    function caption(state) {
      if (state.closed) {
        return <span>Closed: {state.caption}</span>;
      } else {
        return state.caption;
      }
    }

    const workflow = this.props.workflow;
    const state = workflow.statesById[this.props.state || workflow.start];
    return (<FormGroup controlId="state">
      <ControlLabel>State</ControlLabel>
      <Radio data-state={state.id} checked onChange={this.onChange}>{caption(state)}</Radio>
      {state.transitions.map(s => {
        const toState = workflow.statesById[s];
        return (<Radio
            key={toState.id}
            data-state={toState.id}
            onChange={this.onChange}>{caption(toState)}</Radio>);
      })}
    </FormGroup>);
  }
}

StateSelector.propTypes = {
  state: React.PropTypes.string,
  project: React.PropTypes.shape({}),
  workflow: React.PropTypes.shape({}),
};
