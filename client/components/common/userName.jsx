import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchUserInfo } from '../../store/userInfo';

class UserName extends React.Component {
  componentDidMount() {
    const { user } = this.props;
    if (user) {
      this.props.fetchUserInfo(user);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user && nextProps.user !== this.props.user) {
      this.props.fetchUserInfo(nextProps.user);
    }
  }

  render() {
    const { userInfo } = this.props;
    if (userInfo && userInfo.loaded) {
      return <span className="user-name">{userInfo.username}</span>;
    } else {
      return <span className="user-name" />;
    }
  }
}

UserName.propTypes = {
  user: React.PropTypes.string.isRequired,
  userInfo: React.PropTypes.shape({
    fetching: React.PropTypes.bool,
    username: React.PropTypes.string,
  }),
  fetchUserInfo: React.PropTypes.func.isRequired,
};

export default connect(
  (state, ownProps) => ({ userInfo: state.userInfo[ownProps.user] }),
  dispatch => bindActionCreators({ fetchUserInfo }, dispatch),
)(UserName);
