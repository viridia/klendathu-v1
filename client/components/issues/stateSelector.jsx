import React, { PropTypes } from 'react';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Radio from 'react-bootstrap/lib/Radio';
import Immutable from 'immutable';

/** Selects the state of the issue. */
export default class StateSelector extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.stateMap = Immutable.Map(props.workflow.states.map(st => [st.id, st]));
  }

  componentDidUpdate() {
    this.stateMap = Immutable.Map(this.props.workflow.states.map(st => [st.id, st]));
  }

  onChange(e) {
    this.props.onStateChanged(e.target.dataset.state);
  }

  render() {
    function caption(state) {
      if (state.closed) {
        return <span>Closed: {state.caption}</span>;
      } else {
        return state.caption;
      }
    }

    const state = this.stateMap.get(this.props.state);
    const selectedState = this.props.startingState || state.id;
    return (<FormGroup controlId="state">
      <ControlLabel>State</ControlLabel>
      <Radio
          checked={state.id === selectedState}
          data-state={state.id}
          onChange={this.onChange}>{caption(state)}</Radio>
      {state.transitions.map(s => {
        const toState = this.stateMap.get(s);
        return (<Radio
            key={toState.id}
            checked={toState.id === selectedState}
            data-state={toState.id}
            onChange={this.onChange}>{caption(toState)}</Radio>);
      })}
    </FormGroup>);
  }
}

StateSelector.propTypes = {
  state: PropTypes.string.isRequired,
  startingState: PropTypes.string,
  project: PropTypes.shape({}),
  workflow: PropTypes.shape({
    states: PropTypes.arrayOf(PropTypes.shape({}).isRequired).isRequired,
  }).isRequired,
  onStateChanged: PropTypes.func.isRequired,
};
