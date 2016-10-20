import React from 'react';
// import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import { updateWorkflow } from '../../store/workflows';
import StateCard from './stateCard.jsx';
import './workflow.scss';

class WorkflowList extends React.Component {
  render() {
    return (<section className="workflow-list">
      {this.props.stateList.map(state => <StateCard key={state.id} state={state} />)}
    </section>);
  }
}

WorkflowList.propTypes = {
  stateList: React.PropTypes.arrayOf(React.PropTypes.shape({})).isRequired,
};

export default connect(
  (state) => ({
    stateList: (state.workflows.$stateIds || []).map(sid => state.workflows.$stateMap.get(sid)),
  }),
  null,
  // dispatch => bindActionCreators({ updateWorkflow }, dispatch),
)(WorkflowList);
