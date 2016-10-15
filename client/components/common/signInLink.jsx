import React, { PropTypes } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import Button from 'react-bootstrap/lib/Button';

export default function SignInLink(props, context) {
  if (!context.profile) {
    return (
      <LinkContainer to={{ pathname: '/login', query: { next: props.location.pathname } }}>
        <Button className="header-link" bsStyle="link">Sign In</Button>
      </LinkContainer>
    );
  }
  return null;
}

SignInLink.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

SignInLink.contextTypes = {
  profile: PropTypes.shape({}),
};
