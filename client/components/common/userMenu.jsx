import React from 'react';
import { browserHistory } from 'react-router';
import { withApollo } from 'react-apollo';
import ApolloClient from 'apollo-client';
import axios from 'axios';
import { LinkContainer } from 'react-router-bootstrap';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

class UserMenuButton extends React.Component {
  constructor() {
    super();
    this.onSignOut = this.onSignOut.bind(this);
  }

  onSignOut(e) {
    e.preventDefault();
    axios.post('logout').then(() => {
      this.props.client.resetStore();
      browserHistory.push({ pathname: '/login' });
    });
  }

  render() {
    const { profile } = this.context;
    if (!profile || !profile.username) {
      return null;
    }
    return (<DropdownButton bsStyle="primary" title={profile.username} id="user-menu" pullRight>
      <LinkContainer to={{ pathname: '/' }} onlyActiveOnIndex>
        <MenuItem eventKey="dashboard">Dashboard</MenuItem>
      </LinkContainer>
      <LinkContainer to={{ pathname: '/profile' }}>
        <MenuItem eventKey="profile">Your Profile</MenuItem>
      </LinkContainer>
      <MenuItem divider />
      <MenuItem eventKey="4" onClick={this.onSignOut}>Sign out</MenuItem>
    </DropdownButton>);
  }
}

UserMenuButton.propTypes = {
  client: React.PropTypes.instanceOf(ApolloClient).isRequired,
};

UserMenuButton.contextTypes = {
  profile: React.PropTypes.shape({}),
};

export default withApollo(UserMenuButton);
