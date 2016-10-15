import React, { PropTypes } from 'react';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Radio from 'react-bootstrap/lib/Radio';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { setIssueState } from '../../store/actions';

/** Selects the state of the issue. */
class StateSelector extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.stateMap = Immutable.Map(props.workflow.states.map(st => [st.id, st]));
  }

  componentDidUpdate() {
    this.stateMap = Immutable.Map(this.props.workflow.states.map(st => [st.id, st]));
  }

  onChange(e) {
    this.props.setIssueState(e.target.dataset.state);
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
    const selectedState = this.props.issue.state || state.id;
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
  issue: PropTypes.shape({
    state: PropTypes.string,
  }),
  state: PropTypes.string.isRequired,
  project: PropTypes.shape({}),
  workflow: PropTypes.shape({
    states: PropTypes.arrayOf(PropTypes.shape({}).isRequired).isRequired,
  }).isRequired,
  setIssueState: PropTypes.func,
};

export default connect(
  (state) => ({ issue: state.issue }),
  dispatch => bindActionCreators({ setIssueState }, dispatch)
)(StateSelector);
