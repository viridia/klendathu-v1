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

    const prevState = this.props.prevState || this.props.state;
    const nextState = this.props.state;
    const prevStateInfo = this.stateMap.get(prevState);
    const transitions = (this.props.prevState && prevStateInfo)
        ? prevStateInfo.transitions : this.props.workflow.start.filter(st => st !== nextState);
    return (<FormGroup controlId="state">
      <ControlLabel>State</ControlLabel>
      <Radio
          checked={prevState === nextState}
          data-state={prevState}
          onChange={this.onChange}>{caption(prevStateInfo)}</Radio>
      {transitions.map(s => {
        const toState = this.stateMap.get(s);
        return (<Radio
            key={toState.id}
            checked={toState.id === nextState}
            data-state={toState.id}
            onChange={this.onChange}>{caption(toState)}</Radio>);
      })}
    </FormGroup>);
  }
}

StateSelector.propTypes = {
  state: PropTypes.string.isRequired,
  prevState: PropTypes.string,
  project: PropTypes.shape({}),
  workflow: PropTypes.shape({
    states: PropTypes.arrayOf(PropTypes.shape({}).isRequired).isRequired,
    start: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  }).isRequired,
  onStateChanged: PropTypes.func.isRequired,
};
