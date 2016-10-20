import React, { PropTypes } from 'react';
import 'react-redux-toastr/src/less/index.less';
import { graphql } from 'react-apollo';
import LeftNav from './common/leftNav.jsx';
import { ProjectQuery } from '../store/queries';
import './page.scss';

class ProjectPage extends React.Component {
  render() {
    const { children, params, data: { project, errors } } = this.props;
    if (errors) {
      return <p>{JSON.stringify(errors)}</p>;
    }
    if (!this.context.profile || !project) {
      return <div className="content" />;
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
    id: React.PropTypes.string.isRequired,
    username: React.PropTypes.string.isRequired,
  }),
};

export default graphql(ProjectQuery, {
  options: ({ params }) => ({ variables: { project: params.project } }),
})(ProjectPage);
