import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from './common/header.jsx';
import { fetchProjects } from '../store/projects';
import './page.scss';

class Page extends React.Component {
  componentDidMount() {
    this.props.fetchProjects();
  }

  render() {
    const { main, left, location } = this.props;
    return (<div className="kdt page">
      <Header location={location} />
      <div className="content">
        {left}
        {main}
      </div>
    </div>);
  }
}

Page.propTypes = {
  projects: React.PropTypes.shape({
    // loaded: React.PropType.bool.isRequired,
  }).isRequired,
  main: React.PropTypes.node.isRequired,
  left: React.PropTypes.node,
  location: React.PropTypes.shape({}).isRequired,
  fetchProjects: React.PropTypes.func.isRequired,
};

export default connect(
  state => ({ projects: state.projects }),
  dispatch => bindActionCreators({ fetchProjects }, dispatch),
)(Page);
