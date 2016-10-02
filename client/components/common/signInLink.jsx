import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import Button from 'react-bootstrap/lib/Button';
import { connect } from 'react-redux';

function SignInLink(props, _context) {
  if (!props.profile.id) {
    return (
      <LinkContainer to={{ pathname: '/login', query: { next: props.location.pathname } }}>
        <Button className="header-link" bsStyle="link">Sign In</Button>
      </LinkContainer>
    );
  }
  return null;
}

SignInLink.propTypes = {
  profile: React.PropTypes.shape({
    id: React.PropTypes.string,
  }),
  location: React.PropTypes.shape({
    pathname: React.PropTypes.string.isRequired,
  }),
};

SignInLink.contextTypes = {
  store: React.PropTypes.shape({}).isRequired,
};

export default connect(
  state => ({ profile: state.profile }),
  null
)(SignInLink);
