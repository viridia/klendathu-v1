import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import Immutable from 'immutable';
import classNames from 'classnames';
import { addTransition, removeTransition } from '../../store/workflows';
import DiscloseButton from '../common/discloseButton.jsx';
import './workflow.scss';

class StateCard extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.onChangeDisclose = this.onChangeDisclose.bind(this);
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeCaption = this.onChangeCaption.bind(this);
    this.onChangeTransition = this.onChangeTransition.bind(this);
    this.state = {
      expanded: false,
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

  onChangeTransition(e) {
    const id = e.target.dataset.id;
    const { state } = this.props;
    if (e.target.checked) {
      this.props.addTransition([state.id, id]);
    } else {
      this.props.removeTransition([state.id, id]);
    }
  }

  renderTransitions() {
    return this.props.stateList.map(st =>
      <Checkbox
          key={st.id}
          data-id={st.id}
          checked={this.props.state.transitions.has(st.id)}
          disabled={st.id === this.state.id}
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
        <div className="caption">{state.caption}</div>
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
                    value={state.caption}
                    onChange={this.onChangeCaption} />
              </td>
            </tr>
            <tr>
              <th><ControlLabel>To:</ControlLabel></th>
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
    transitions: React.PropTypes.instanceOf(Immutable.Set).isRequired,
  }),
  stateList: React.PropTypes.arrayOf(React.PropTypes.shape({})),
  addTransition: React.PropTypes.func.isRequired,
  removeTransition: React.PropTypes.func.isRequired,
};

export default connect(
  (state) => ({
    stateList: (state.workflows.$stateIds || []).map(sid => state.workflows.$stateMap.get(sid)),
  }),
  dispatch => bindActionCreators({ addTransition, removeTransition }, dispatch),
)(StateCard);
