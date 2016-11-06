import React, { PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import './workflowActions.scss';

export default class WorkflowActions extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      actions: this.buildActionTable(props),
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ actions: this.buildActionTable(nextProps) });
  }

  shouldComponentUpdate(nextProps) {
    return this.props.state !== nextProps.state || this.props.project !== nextProps.project;
  }

  /** Searches the issue for the owner prior to the current owner. */
  findPreviousOwner() {
    const issue = this.props.issue;
    const owner = issue.owner;
    if (!issue.changes) {
      return undefined;
    }
    for (let i = issue.changes.length - 1; i >= 0; i -= 1) {
      const change = issue.changes[i];
      if (change.owner !== undefined && change.owner !== owner) {
        return change.owner;
      }
    }
    return undefined;
  }

  /** Determine if the state transition for the action is a legal one. */
  isLegalTransition(props, action) {
    const { project, state } = props;
    const wfState = project.workflow.statesById.get(state);
    // Make sure the state we're transitioning to is acceptable.
    if (action.state && wfState.transitions.indexOf(action.state) < 0) {
      return false;
    }
    // Check if this action has a current state requirement.
    if (action.require && action.require.state) {
      if (action.require.state.indexOf(state) < 0) {
        return false;
      }
    }
    // Make sure the state we're going to is spelled correctly in the config.
    const toState = project.workflow.statesById.get(action.state);
    if (!toState) {
      return false;
    }
    return true;
  }

  buildActionTable(props) {
    const { project, issue } = props;
    if (!project.workflow.actions) {
      return [];
    }
    const actions = [];
    for (const action of project.workflow.actions) {
      if (this.isLegalTransition(props, action)) {
        const resolvedAction = {
          caption: action.caption,
        };
        if (action.state) {
          const toState = project.workflow.statesById.get(action.state);
          resolvedAction.state = action.state;
          resolvedAction.stateName = toState.caption;
        }
        // Handle owner expressions.
        if (typeof action.owner === 'string') {
          const m = action.owner.match(/\{(\w+?)\}/);
          if (m) {
            const oName = m[1];
            if (oName === 'me') {
              resolvedAction.owner = this.context.profile.username;
            } else if (oName === 'reporter') {
              resolvedAction.owner = this.props.issue.reporter;
            } else if (oName === 'previous') {
              resolvedAction.owner = this.findPreviousOwner();
            } else if (oName === 'none') {
              resolvedAction.owner = null;
            }
          }
          // If the owner wouldn't change, then don't show that effect.
          if (resolvedAction.owner === issue.owner) {
            resolvedAction.owner = undefined;
          }
        }
        // Only include actions that have an effect.
        if (resolvedAction.state !== undefined || resolvedAction !== undefined) {
          actions.push(resolvedAction);
        }
      }
    }
    return actions;
  }

  render() {
    return (<section className="wf-actions">
      {this.state.actions.map((a, index) => (<div className="wf-action" key={index}>
        <Button bsStyle="default" onClick={() => this.props.onExecAction(a)}>{a.caption}</Button>
        {a.state &&
          <div className="effect">state &rarr; <span className="value">{a.stateName}</span></div>}
        {a.owner &&
          <div className="effect">owner &rarr; <span className="value">{a.owner}</span></div>}
        {a.owner === null &&
          <div className="effect">owner &rarr; <span className="none">none</span></div>}
      </div>))}
    </section>);
  }
}

WorkflowActions.propTypes = {
  state: PropTypes.string.isRequired,
  issue: PropTypes.shape({
    reporter: PropTypes.string,
    changes: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    role: PropTypes.number.isRequired,
  }).isRequired,
  onExecAction: PropTypes.func.isRequired,
};

WorkflowActions.contextTypes = {
  profile: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }),
};
