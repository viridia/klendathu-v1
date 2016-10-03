import React from 'react';
import './workflow.scss';

export default class WorkflowDiagram extends React.Component {
  render() {
    const { workflow } = this.props;
    const states = workflow && workflow.states ? workflow.states : [];
    return (
      <section className="workflow-diagram">
        {states.map(st => (
          <div className="workflow-node" key={st.id}>{st.caption}</div>
        ))}
      </section>
    );
  }
}

WorkflowDiagram.propTypes = {
  workflow: React.PropTypes.shape({}),
};
