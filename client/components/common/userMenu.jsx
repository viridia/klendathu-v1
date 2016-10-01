import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
// import { connect } from 'react-redux';
// import axios from 'axios';
// import * as actions from '../../store/actions';

export default class UserMenuButton extends React.Component {
  render() {
    return (<DropdownButton bsStyle="primary" title="user" id="user-menu" pullRight>
      <LinkContainer to={{ pathname: '/profile' }}>
        <MenuItem eventKey="1">Your Profile</MenuItem>
      </LinkContainer>
      <MenuItem eventKey="2">Another action</MenuItem>
      <MenuItem eventKey="3" active>Active Item</MenuItem>
      <MenuItem divider />
      <MenuItem eventKey="4">Sign out</MenuItem>
    </DropdownButton>);
  }
  // (props, context) {
  // function signOut(ev) {
  //   ev.preventDefault();
  //   axios.post('logout').then(() => {
  //     context.store.dispatch(actions.logout());
  //   }, reason => {
  //     console.error('logout error:', reason);
  //   });
  // }
  // if (props.user && props.user.username) {
  //   return (<Button className="header-link" bsStyle="link" onClick={signOut}>Sign Out</Button>);
  // } else {
  //   return (
  //     <LinkContainer to={{ pathname: '/login', query: { next: props.location.pathname } }}>
  //       <Button className="header-link" bsStyle="link">Sign In</Button>
  //     </LinkContainer>
  //   );
  // }
}
//
// SignInLink.propTypes = {
//   user: React.PropTypes.shape({
//     username: React.PropTypes.string,
//   }),
//   location: React.PropTypes.shape({
//     pathname: React.PropTypes.string.isRequired,
//   }),
// };
//
// SignInLink.contextTypes = {
//   store: React.PropTypes.shape({}).isRequired,
// };
//
// function mapStateToProps(state) {
//   return {
//     user: state.user,
//   };
// }
//
// export default connect(mapStateToProps, null)(SignInLink);
