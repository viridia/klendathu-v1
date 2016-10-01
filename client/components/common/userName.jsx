import React from 'react';
import { connect } from 'react-redux';
// import * as actions from '../../store/actions';

function UserName(props) {
  if (props.user && !props.user.fetching) {
    return <span className="user-name">{props.user.username}</span>;
  } else {
    return <span className="user-name" />;
  }
}

UserName.propTypes = {
  user: React.PropTypes.shape({
    fetching: React.PropTypes.bool,
    username: React.PropTypes.string,
  }),
};

export default connect(
  (state, ownProps) => ({ user: state.userInfo[ownProps.user] }),
  null
)(UserName);
