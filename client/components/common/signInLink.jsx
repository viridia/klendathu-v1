import React, { PropTypes } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import Button from 'react-bootstrap/lib/Button';
// import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

function SignInLink(props, _context) {
  console.log(props.data, props.data.profile);
  if (!props.data.profile) {
  // if (!props.profile.id) {
    return (
      <LinkContainer to={{ pathname: '/login', query: { next: props.location.pathname } }}>
        <Button className="header-link" bsStyle="link">Sign In</Button>
      </LinkContainer>
    );
  }
  return null;
}

SignInLink.propTypes = {
  data: PropTypes.shape({
    profile: PropTypes.shape({}),
  }),
  // profile: PropTypes.shape({
  //   id: PropTypes.string,
  // }),
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }),
};

SignInLink.contextTypes = {
  store: PropTypes.shape({}).isRequired,
};

const ProfileQuery = gql`query ProfileQuery {
  profile {
    id
    username
    fullname
  }
  users {
    username
  }
}`;

export default graphql(ProfileQuery)(SignInLink);

// export default connect(
//   state => ({ profile: state.profile }),
//   null
// )(SignInLink);
