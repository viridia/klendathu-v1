import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Button from 'react-bootstrap/lib/Button';
import Collapse from 'react-bootstrap/lib/Collapse';
import MassAction from './massAction.jsx';
import './massEdit.scss';

class MassEdit extends React.Component {
  constructor() {
    super();
    this.onChangeAction = this.onChangeAction.bind(this);
    this.onRemoveAction = this.onRemoveAction.bind(this);
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

  render() {
    const { selection } = this.props;
    return (
      <Collapse in={selection.size > 0}>
        <section className="card mass-edit">
          <header className="filters">
            <div className="title">
              Mass Edit ({selection.size} issues)
            </div>
            <Button bsStyle="default">Reset</Button>
            <Button bsStyle="primary">Execute</Button>
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
  selection: ImmutablePropTypes.set.isRequired,
};

export default connect(
  (state) => ({
    selection: state.issueSelection,
  }),
)(MassEdit);
