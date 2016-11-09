import React, { PropTypes } from 'react';
import 'react-redux-toastr/src/less/index.less';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { graphql } from 'react-apollo';
import ErrorDisplay from './debug/errorDisplay.jsx';
import LeftNav from './common/leftNav.jsx';
import ProjectQuery from '../graphql/queries/project.graphql';
import { ProjectContent } from '../store/fragments';
import './page.scss';

class ProjectPage extends React.Component {
  render() {
    const { children, params, data: { project, error, loading } } = this.props;
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
