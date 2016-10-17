import React, { PropTypes } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

class UserName extends React.Component {
  render() {
    const userInfo = this.props.data.user;
    if (userInfo) {
      return (<span className="user-name">
        {this.props.full && userInfo.fullname &&
          <span className="full">{userInfo.fullname} - </span>}
        {userInfo.username}
      </span>);
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
};

const UserQuery = gql`query UserQuery($user: ID!) {
  user(id: $user) {
    id
    username
    fullname
    photo
  }
}`;

export default graphql(UserQuery, {
  options: ({ user }) => ({ variables: { user } }),
})(UserName);
