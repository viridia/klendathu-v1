import React, { PropTypes } from 'react';
import { graphql } from 'react-apollo';
import UserQuery from '../../graphql/queries/user.graphql';

class UserName extends React.Component {
  render() {
    const userInfo = this.props.data.user;
    if (userInfo) {
      if (this.props.fullOnly && userInfo.fullname) {
        return (
          <span className="user-name" title={userInfo.userName}>
            <span className="full">{userInfo.fullname}</span>
          </span>
        );
      } else if (this.props.full && userInfo.fullname) {
        return (
          <span className="user-name">
            <span className="full">{userInfo.fullname}</span>
            &nbsp;({userInfo.username})
          </span>
        );
      } else {
        return <span className="user-name">{userInfo.username}</span>;
      }
    } else {
      return <span className="user-name" />;
    }
  }
}

UserName.propTypes = {
  user: PropTypes.string.isRequired,
  data: PropTypes.shape({
    user: PropTypes.shape({}),
  }),
  full: PropTypes.bool,
  fullOnly: PropTypes.bool,
};

export default graphql(UserQuery, {
  options: ({ user }) => ({ variables: { user } }),
})(UserName);
