import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Button from 'react-bootstrap/lib/Button';
import Collapse from 'react-bootstrap/lib/Collapse';
import MassAction from './massAction.jsx';
import { updateIssue } from '../../store/issue';
import './massEdit.scss';

class MassEdit extends React.Component {
  constructor() {
    super();
    this.onChangeAction = this.onChangeAction.bind(this);
    this.onRemoveAction = this.onRemoveAction.bind(this);
    this.onSave = this.onSave.bind(this);
    this.state = {
      expanded: true,
      actions: Immutable.List.of(), // TODO: Derive from location params
    };
  }

  onChangeAction(index, action) {
    if (index !== undefined) {
      this.setState({ actions: this.state.actions.set(index, action) });
    } else {
      this.setState({ actions: this.state.actions.push(action) });
    }
  }

  onRemoveAction(index) {
    this.setState({ actions: this.state.actions.remove(index) });
  }

  onSave(e) {
    e.preventDefault();
    const { selection, issues, project } = this.props;
    const promises = [];
    for (const issue of issues) {
      let changed = false;
      let deleted = false;
      if (selection.has(issue.id)) {
        const updates = {};
        this.state.actions.forEach(action => {
          if (action.id === 'delete') {
            deleted = true;
          } else {
            changed = action.apply(issue, updates, action.value) || changed;
          }
        });
        if (deleted) {
          console.error('Implement issue deletion.');
        } else if (changed) {
          promises.push(updateIssue(project.id, issue.id, updates));
        }
      }
    }
  }

  render() {
    const { selection } = this.props;
    return (
      <Collapse in={selection.size > 0}>
        <section className="card mass-edit">
          <header className="filters">
            <div className="title">
              Mass Edit ({selection.size} issues selected)
            </div>
            <Button
                bsStyle="info"
                bsSize="small"
                disabled={this.state.actions.size === 0}
                onClick={this.onSave}>Save All Changes</Button>
          </header>
          <section className="action-list">
            {this.state.actions.map((action, index) => (
              <MassAction
                  index={index}
                  key={index}
                  action={action}
                  project={this.props.project}
                  onRemove={this.onRemoveAction}
                  onChange={this.onChangeAction} />))}
            <MassAction
                project={this.props.project}
                onRemove={this.onRemoveAction}
                onChange={this.onChangeAction} />
          </section>
        </section>
      </Collapse>);
  }
}

MassEdit.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    template: PropTypes.shape({
      types: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  }).isRequired,
  issues: PropTypes.arrayOf(PropTypes.shape({})),
  selection: ImmutablePropTypes.set.isRequired,
};

export default connect(
  (state) => ({
    selection: state.issueSelection,
  }),
)(MassEdit);
