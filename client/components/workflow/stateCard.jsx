import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import Immutable from 'immutable';
import classNames from 'classnames';
import { addTransition, removeTransition, updateWorkflowState } from '../../store/workflows';
import DiscloseButton from '../common/discloseButton.jsx';
import './workflow.scss';

class StateCard extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.onChangeDisclose = this.onChangeDisclose.bind(this);
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeCaption = this.onChangeCaption.bind(this);
    this.onChangeClosed = this.onChangeClosed.bind(this);
    this.onChangeTransition = this.onChangeTransition.bind(this);
    this.onCaptionBlur = this.onCaptionBlur.bind(this);
    this.state = {
      expanded: false,
      caption: props.state.caption,
    };
  }

  onChangeDisclose(e) {
    e.preventDefault();
    this.setState({ expanded: !this.state.expanded });
  }

  onChangeName(e) {
    e.preventDefault();
    this.setState({ id: e.target.value });
  }

  onChangeCaption(e) {
    e.preventDefault();
    this.setState({ caption: e.target.value });
  }

  onChangeClosed(e) {
    const { state } = this.props;
    this.props.updateWorkflowState([state.id, { ...state, closed: e.target.checked }]);
  }

  onChangeTransition(e) {
    const id = e.target.dataset.id;
    const { state } = this.props;
    if (e.target.checked) {
      this.props.addTransition(state.id, id);
    } else {
      this.props.removeTransition(state.id, id);
    }
  }

  onCaptionBlur() {
    const { state } = this.props;
    this.props.updateWorkflowState([state.id, { ...state, caption: this.state.caption }]);
  }

  renderTransitions() {
    return this.props.stateList.map(st =>
      <Checkbox
          key={st.id}
          data-id={st.id}
          checked={this.props.state.transitions.has(st.id)}
          disabled={st.id === this.props.state.id}
          onChange={this.onChangeTransition}>
        {st.caption}
      </Checkbox>);
  }

  render() {
    const { state } = this.props;
    return (<section
        className={classNames('card internal workflow-state', { collapsed: !this.state.expanded })}
        key={state.id}>
      <header>
        <DiscloseButton checked={this.state.expanded} onClick={this.onChangeDisclose} />
        <div className="caption">{state.closed && 'Closed: '}{state.caption}</div>
        <div className="ident">{state.id}</div>
      </header>
      <div className="body">
        <table className="form-table">
          <tbody>
            <tr>
              <th><ControlLabel>Caption:</ControlLabel></th>
              <td>
                <FormControl
                    className="summary"
                    type="text"
                    placeholder="display name of this state"
                    value={this.state.caption}
                    onChange={this.onChangeCaption}
                    onBlur={this.onCaptionBlur} />
                <Checkbox checked={this.props.state.closed} onChange={this.onChangeClosed}>
                  Closed
                </Checkbox>
              </td>
            </tr>
            <tr>
              <th><ControlLabel>Transition to:</ControlLabel></th>
              <td className="to-states">
                {this.renderTransitions()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>);
  }
}

StateCard.propTypes = {
  state: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    caption: React.PropTypes.string.isRequired,
    closed: React.PropTypes.bool.isRequired,
    transitions: React.PropTypes.instanceOf(Immutable.Set).isRequired,
  }),
  stateList: React.PropTypes.arrayOf(React.PropTypes.shape({})),
  addTransition: React.PropTypes.func.isRequired,
  removeTransition: React.PropTypes.func.isRequired,
  updateWorkflowState: React.PropTypes.func.isRequired,
};

export default connect(
  (state) => ({
    stateList: (state.workflows.$stateIds || []).map(sid => state.workflows.$stateMap.get(sid)),
  }),
  dispatch => bindActionCreators(
      { addTransition, removeTransition, updateWorkflowState },
      dispatch),
)(StateCard);
