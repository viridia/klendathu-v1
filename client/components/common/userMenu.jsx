import React from 'react';
import { browserHistory } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { logout } from '../../store/profile';

class UserMenuButton extends React.Component {
  constructor() {
    super();
    this.onSignOut = this.onSignOut.bind(this);
  }

  onSignOut(e) {
    e.preventDefault();
    this.props.logout().then(() => {
      browserHistory.push({ pathname: '/login' });
    });
  }

  render() {
    const { profile } = this.props;
    if (!profile.id) {
      return null;
    }
    return (<DropdownButton bsStyle="primary" title={profile.username} id="user-menu" pullRight>
      <LinkContainer to={{ pathname: '/profile' }}>
        <MenuItem eventKey="1">Your Profile</MenuItem>
      </LinkContainer>
      <MenuItem eventKey="2">Another action</MenuItem>
      <MenuItem eventKey="3" active>Active Item</MenuItem>
      <MenuItem divider />
      <MenuItem eventKey="4" onClick={this.onSignOut}>Sign out</MenuItem>
    </DropdownButton>);
  }
}

UserMenuButton.propTypes = {
  profile: React.PropTypes.shape({
  }),
  logout: React.PropTypes.func.isRequired,
};

export default connect(
  (state) => ({
    profile: state.profile,
  }),
  dispatch => bindActionCreators({ logout }, dispatch),
)(UserMenuButton);
