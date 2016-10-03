import React from 'react';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import classNames from 'classnames';
import Immutable from 'immutable';
import DiscloseButton from '../common/discloseButton.jsx';
import './workflow.scss';

class WorkflowCard extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.onChangeDisclose = this.onChangeDisclose.bind(this);
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeCaption = this.onChangeCaption.bind(this);
    this.onChangeTo = this.onChangeTo.bind(this);
    this.state = {
      expanded: false,
      id: props.state.id,
      caption: props.state.caption,
      to: new Immutable.Set(props.state.to || []),
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

  onChangeTo(e) {
    const id = e.target.dataset.id;
    if (e.target.checked) {
      this.setState({ to: this.state.to.add(id) });
    } else {
      this.setState({ to: this.state.to.delete(id) });
    }
  }

  renderToStates() {
    return this.props.workflow.states.map(st =>
      <Checkbox
          key={st.id}
          data-id={st.id}
          checked={this.state.to.has(st.id)}
          onChange={this.onChangeTo}>
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
              <th><ControlLabel>ID:</ControlLabel></th>
              <td>
                <FormControl
                    className="summary"
                    type="text"
                    placeholder="summary of this issue"
                    value={this.state.id}
                    onChange={this.onChangeName} />
              </td>
            </tr>
            <tr>
              <th><ControlLabel>Caption:</ControlLabel></th>
              <td>
                <FormControl
                    className="summary"
                    type="text"
                    placeholder="summary of this issue"
                    value={this.state.caption}
                    onChange={this.onChangeCaption} />
              </td>
            </tr>
            <tr>
              <th><ControlLabel>To:</ControlLabel></th>
              <td className="to-states">
                {this.renderToStates()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>);
  }
}

WorkflowCard.propTypes = {
  project: React.PropTypes.shape({}),
  workflow: React.PropTypes.shape({
    states: React.PropTypes.arrayOf(React.PropTypes.shape({})),
  }),
  state: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    caption: React.PropTypes.string.isRequired,
    to: React.PropTypes.arrayOf(React.PropTypes.string.isRequired),
  }),
};

export default class WorkflowList extends React.Component {
  render() {
    const { workflow } = this.props;
    return (<section className="workflow-list">
      {workflow.states.map(state =>
          (<WorkflowCard key={state.id} workflow={workflow} state={state} />))}
    </section>);
  }
}

WorkflowList.propTypes = {
  project: React.PropTypes.shape({}),
  workflow: React.PropTypes.shape({}),
};
