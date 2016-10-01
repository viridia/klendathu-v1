import React from 'react';
import { browserHistory } from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import { LinkContainer } from 'react-router-bootstrap';
import axios from 'axios';
import Store from '../../store/store';
import Header from '../common/header.jsx';
import * as actions from '../../store/actions';
import './login.scss';

export default class SignUpPage extends React.Component {
  constructor() {
    super();
    this.state = {
      userName: '',
      userNameError: null,
      fullName: '',
      fullNameError: null,
      email: '',
      emailError: null,
      password: '',
      passwordError: null,
      password2: '',
      password2Error: null,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeUserName = this.onChangeUserName.bind(this);
    this.onChangeFullName = this.onChangeFullName.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onChangePassword2 = this.onChangePassword2.bind(this);
  }

  onSubmit(ev) {
    ev.preventDefault();
    axios.post('signup', {
      username: this.state.userName,
      fullname: this.state.fullName,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2,
    }).then(resp => {
      const errState = {
        userNameError: null,
        fullNameError: null,
        emailError: null,
        passwordError: null,
        password2Error: null,
      };
      switch (resp.data.err) {
        case 'user-exists': errState.userNameError = 'User name not available.'; break;
        case 'invalid-name': errState.nameError = 'Invalid name.'; break;
        case 'invalid-email': errState.emailError = 'Invalid email address.'; break;
        case 'invalid-password': errState.passwordError = 'Invalid password.'; break;
        case 'password-match':
          errState.password2Error = 'Confirmation password does not match.';
          break;
        default: {
          const { next } = this.props.location.query;
          Store.dispatch(actions.login(resp.data));
          browserHistory.push({ pathname: next || '/' });
          return;
        }
      }
      this.setState(errState);
    }, reason => {
      console.error('signup error:', reason);
    });
  }

  onChangeFullName(e) {
    this.setState({ fullName: e.target.value });
  }

  onChangeUserName(e) {
    this.setState({ userName: e.target.value });
  }

  onChangeEmail(e) {
    this.setState({ email: e.target.value });
  }

  onChangePassword(e) {
    this.setState({ password: e.target.value });
  }

  onChangePassword2(e) {
    this.setState({ password2: e.target.value });
  }

  render() {
    const { next } = this.props.location.query;
    return (<div className="kdt page">
      <Header location={this.props.location} />
      <div className="login-content">
        <div className="login-spacer-before" />
        <div className="login card">
          <form className="login-form" onSubmit={this.onSubmit}>
            <FormGroup controlId="name" validationState={this.state.userNameError && 'error'}>
              <ControlLabel>User name</ControlLabel>
              <FormControl
                  type="text"
                  value={this.state.userName}
                  placeholder="Choose a user name"
                  onChange={this.onChangeUserName} />
              <FormControl.Feedback />
              <HelpBlock>{this.state.userNameError}</HelpBlock>
            </FormGroup>
            <FormGroup controlId="name" validationState={this.state.fullNameError && 'error'}>
              <ControlLabel>Your full name</ControlLabel>
              <FormControl
                  type="text"
                  value={this.state.fullName}
                  placeholder="Enter your full name"
                  onChange={this.onChangeFullName} />
              <FormControl.Feedback />
              <HelpBlock>{this.state.fullNameError}</HelpBlock>
            </FormGroup>
            <FormGroup controlId="email" validationState={this.state.emailError && 'error'}>
              <ControlLabel>Email</ControlLabel>
              <FormControl
                  type="text"
                  value={this.state.email}
                  placeholder="Enter email address"
                  onChange={this.onChangeEmail} />
              <FormControl.Feedback />
              <HelpBlock>{this.state.emailError}</HelpBlock>
            </FormGroup>
            <FormGroup controlId="password" validationState={this.state.passwordError && 'error'}>
              <ControlLabel>Password</ControlLabel>
              <FormControl
                  type="password"
                  value={this.state.password}
                  placeholder="Choose a password"
                  onChange={this.onChangePassword} />
              <FormControl.Feedback />
              <HelpBlock>{this.state.passwordError}</HelpBlock>
            </FormGroup>
            <FormGroup
                controlId="confirm_password"
                validationState={this.state.password2Error && 'error'}>
              <ControlLabel>Confirm Password</ControlLabel>
              <FormControl
                  type="password"
                  value={this.state.password2}
                  placeholder="Re-enter your password"
                  onChange={this.onChangePassword2} />
              <FormControl.Feedback />
              <HelpBlock>{this.state.password2Error}</HelpBlock>
            </FormGroup>
            <div className="button-row">
              <LinkContainer to={{ pathname: '/login', query: this.props.location.query }}>
                <Button bsStyle="link">Sign In</Button>
              </LinkContainer>
              <LinkContainer to={{ pathname: next || '/' }}>
                <Button bsStyle="default">Cancel</Button>
              </LinkContainer>
              <Button bsStyle="primary" type="submit">Create Account</Button>
            </div>
          </form>
        </div>
        <div className="login-spacer-after" />
      </div>
    </div>);
  }
}

SignUpPage.propTypes = {
  location: React.PropTypes.shape({
    query: React.PropTypes.string.isRequired,
  }).isRequired,
};