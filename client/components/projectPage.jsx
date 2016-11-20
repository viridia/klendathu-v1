import React, { PropTypes } from 'react';
// import Perf from 'react-addons-perf';
import 'react-redux-toastr/src/less/index.less';
import equal from 'deep-equal';
import Immutable from 'immutable';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { graphql } from 'react-apollo';
import ErrorDisplay from './debug/errorDisplay.jsx';
import LeftNav from './common/leftNav.jsx';
import ProjectQuery from '../graphql/queries/project.graphql';
import { ProjectContent } from '../store/fragments';
import './page.scss';

class ProjectPage extends React.Component {
  constructor(props) {
    super(props);
    this.cachedProject = props.data.project;
    this.buildProjectMaps();
    // Perf.start();
  }

  componentDidMount() {
    // setTimeout(() => {
    //   Perf.stop();
    //   Perf.printWasted(Perf.getLastMeasurements());
    // }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    // Make sure that project pointer doesn't change unless value does. Allows shallow compares.
    if (!equal(this.cachedProject, nextProps.data.project)) {
      this.cachedProject = nextProps.data.project;
      this.buildProjectMaps();
    }
  }

  buildProjectMaps() {
    const project = this.cachedProject;
    if (project) {
      // Add map of types by id
      if (project.template) {
        project.template.typesById = Immutable.Map(project.template.types.map(t => [t.id, t]));
        const fieldsById = new Map();
        const fieldList = [];
        project.template.types.forEach(t => {
          if (t.fields) {
            t.fields.forEach(f => {
              fieldsById.set(f.id, f);
              fieldList.push([f.caption, f.id]);
            });
          }
        });
        fieldList.sort();
        project.template.customFieldsById = new Immutable.Map(fieldsById);
        project.template.customFieldList = new Immutable.List(fieldList);
      }
      // Add map of states by id
      if (project.workflow) {
        project.workflow.statesById = Immutable.Map(project.workflow.states.map(s => [s.id, s]));
      }
    }
  }

  render() {
    const { children, params, data: { error, loading } } = this.props;
    const project = this.cachedProject;
    if (error) {
      return <ErrorDisplay error={error} />;
    } else if (loading) {
      return <div className="content" />;
    } else if (!this.context.profile) {
      return <div className="content">Profile not loaded</div>;
    } else if (!project) {
      return <div className="content">Project not found</div>;
    }
    const child = React.Children.only(children);
    const main = React.cloneElement(child, { project, params });
    return (<div className="content">
      <LeftNav project={project} />
      {main}
    </div>);
  }
}

ProjectPage.propTypes = {
  data: PropTypes.shape({
    errors: PropTypes.shape({}),
    project: PropTypes.shape({}),
  }).isRequired,
  children: PropTypes.node.isRequired,
  params: PropTypes.shape({}).isRequired,
};

ProjectPage.contextTypes = {
  profile: React.PropTypes.shape({
    username: React.PropTypes.string.isRequired,
  }),
};

export default DragDropContext(HTML5Backend)(graphql(ProjectQuery, { // eslint-disable-line
  options: ({ params }) => ({
    variables: { project: params.project },
    fragments: [ProjectContent],
  }),
})(ProjectPage));
