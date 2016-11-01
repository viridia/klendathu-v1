import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { graphql } from 'react-apollo';
import ReduxToastr from 'react-redux-toastr';
import 'react-redux-toastr/src/less/index.less';
import Header from './common/header.jsx';
import ErrorDisplay from './debug/errorDisplay.jsx';
import ProfileQuery from '../graphql/queries/profile.graphql';
import './page.scss';

class Page extends React.Component {
  getChildContext() {
    return { profile: this.props.data.profile };
  }

  componentDidMount() {
    this.checkAuth(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.checkAuth(nextProps);
  }

  checkAuth(props) {
    const { data: { loading, error, profile }, location } = props;
    if (!profile && !loading && !error) {
      // console.log('checkAuth:', props.data, location);
      browserHistory.replace({ pathname: '/login', state: { next: location } });
    } else if (profile && !profile.username) {
      browserHistory.replace({ pathname: '/finishSignup', state: { next: location } });
    }
  }

  render() {
    const { children, location, params, data: { error, profile } } = this.props;
    if (error) {
      return <ErrorDisplay error={error} />;
    }
    const child = React.Children.only(children);
    const main = React.cloneElement(child, { params, profile });
    return (<div className="kdt page">
      <ReduxToastr position="bottom-left" />
      <Header location={location} params={params} />
      {main}
    </div>);
  }
}

Page.propTypes = {
  data: PropTypes.shape({
    errors: PropTypes.shape({}),
    profile: PropTypes.shape({
      id: PropTypes.string,
    }),
    loading: PropTypes.bool,
  }).isRequired,
  children: PropTypes.node.isRequired,
  location: PropTypes.shape({}).isRequired,
  params: PropTypes.shape({}).isRequired,
};

Page.childContextTypes = {
  profile: PropTypes.shape({
    id: PropTypes.string,
  }),
};

export default graphql(ProfileQuery)(Page);
