import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { withApollo } from 'react-apollo';
import axios from 'axios';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import ApolloClient from 'apollo-client';
import { LinkContainer } from 'react-router-bootstrap';
import Header from '../common/header.jsx';
import './login.scss';

class LoginPage extends React.Component {
  constructor() {
    super();
    this.state = {
      userName: '',
      userNameError: null,
      password: '',
      passwordError: null,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeUserName = this.onChangeUserName.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
  }

  onSubmit(ev) {
    ev.preventDefault();
    axios.post('login', {
      username: this.state.userName,
      password: this.state.password,
    }).then(resp => {
      const errState = {
        userNameError: null,
        passwordError: null,
      };
      switch (resp.err) {
        case 'unknown-user': errState.userNameError = 'Unknown user.'; break;
        case 'incorrect-password': errState.passwordError = 'Incorrect password.'; break;
        default: {
          this.props.client.resetStore();
          const { next } = this.props.location.state || {};
          browserHistory.push(next || { pathname: '/' });
          return;
        }
      }
      this.setState(errState);
    }, reason => {
      console.error('login error:', reason);
    });
  }

  onChangeUserName(e) {
    this.setState({ userName: e.target.value });
  }

  onChangePassword(e) {
    this.setState({ password: e.target.value });
  }

  render() {
    const canSubmit = this.state.userName.length > 1 && this.state.password.length > 1;
    const { next } = this.props.location.state || {};
    let nextUrl = '';
    if (next) {
      const loc = browserHistory.createLocation(next);
      nextUrl = loc.pathname;
      if (loc.search) {
        nextUrl += loc.search;
      }
      nextUrl = `?next=${encodeURIComponent(nextUrl)}`;
    }
// http://localhost:8080/project/test-project/issues?label=18
    return (<div className="kdt page">
      <Header location={this.props.location} params={this.props.params} />
      <div className="login-content">
        <div className="login-spacer-before" />
        <div className="login card">
          <form className="login-form" onSubmit={this.onSubmit}>
            <FormGroup controlId="username" validationState={this.state.userNameError && 'error'}>
              <ControlLabel>User name</ControlLabel>
              <FormControl
                  type="text"
                  value={this.state.userName}
                  placeholder="Enter user name"
                  onChange={this.onChangeUserName} />
              <FormControl.Feedback />
              <HelpBlock>{this.state.userNameError}</HelpBlock>
            </FormGroup>
            <FormGroup controlId="password" validationState={this.state.passwordError && 'error'}>
              <ControlLabel>Password</ControlLabel>
              <FormControl
                  type="password"
                  value={this.state.password}
                  placeholder="Enter password"
                  onChange={this.onChangePassword}
                  name="password" />
              <FormControl.Feedback />
              <HelpBlock>{this.state.passwordError}</HelpBlock>
            </FormGroup>
            <div className="button-row">
              <LinkContainer to={{ ...this.props.location, pathname: '/signup' }}>
                <Button bsStyle="link">Create Account</Button>
              </LinkContainer>
              <Button bsStyle="primary" type="submit" disabled={!canSubmit}>Sign In</Button>
            </div>
          </form>
          <div className="divider" />
          <div className="providers">
            <Button bsStyle="primary" href={`/auth/google${nextUrl}`}>Log in with Google</Button>
            <Button bsStyle="primary" href="/auth/github">Log in with Github</Button>
            <Button bsStyle="primary" href="/auth/other">Something else?</Button>
          </div>
        </div>
        <div className="login-spacer-after" />
      </div>
    </div>);
  }
}

LoginPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      next: PropTypes.object,
    }),
  }).isRequired,
  params: PropTypes.shape({}),
  client: PropTypes.instanceOf(ApolloClient).isRequired,
};

export default withApollo(LoginPage);
