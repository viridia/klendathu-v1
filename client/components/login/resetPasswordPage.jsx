import React, { PropTypes } from 'react';
import { withApollo } from 'react-apollo';
import { browserHistory } from 'react-router';
import axios from 'axios';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import ApolloClient from 'apollo-client';
import Header from '../common/header.jsx';
import AlertDialog from '../common/alertDialog.jsx';
import './login.scss';

class ResetPasswordPage extends React.Component {
  constructor() {
    super();
    this.state = {
      password: '',
      passwordError: null,
      password2: '',
      password2Error: null,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onChangePassword2 = this.onChangePassword2.bind(this);
  }

  onSubmit(ev) {
    ev.preventDefault();
    const { user, token } = this.props.location.query;
    axios.post('resetpw', {
      password: this.state.password,
      password2: this.state.password2,
      username: user,
      token,
    }).then(resp => {
      const errState = {
        passwordError: null,
        password2Error: null,
      };
      switch (resp.data.err) {
        case 'password-match':
          errState.password2Error = 'Confirmation password does not match.';
          break;
        case 'password-too-short':
          errState.password2Error = 'Password must be at least 5 characters.';
          break;
        default: {
          this.props.client.resetStore();
          browserHistory.push({ pathname: '/' });
          return;
        }
      }
      this.setState(errState);
    }, reason => {
      console.error('signup error:', reason);
    });
  }

  onChangePassword(e) {
    this.setState({ password: e.target.value });
  }

  onChangePassword2(e) {
    this.setState({ password2: e.target.value });
  }

  render() {
    const canSubmit = this.state.password.length > 5
        && this.state.password2 === this.state.password;
    return (<div className="kdt page">
      {this.state.showMessage && (<AlertDialog
          title="Password verification email has been sent"
          primaryText="OK"
          onHide={this.onHideMessage}>
        It make take a few moments for the email to arrive.
      </AlertDialog>)}
      <Header location={this.props.location} params={this.props.params} />
      <div className="login-content">
        <div className="login-spacer-before" />
        <div className="login card">
          <form className="login-form" onSubmit={this.onSubmit}>
            Choose a new password:
            <FormGroup controlId="password" validationState={this.state.passwordError && 'error'}>
              <ControlLabel>New Password</ControlLabel>
              <FormControl
                  type="password"
                  value={this.state.password}
                  placeholder="Enter new password"
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
              <div />
              <Button bsStyle="primary" type="submit" disabled={!canSubmit}>Save</Button>
            </div>
          </form>
        </div>
        <div className="login-spacer-after" />
      </div>
    </div>);
  }
}

ResetPasswordPage.propTypes = {
  location: PropTypes.shape({
    query: PropTypes.shape({
      token: PropTypes.string.isRequired,
      user: PropTypes.string.isRequired,
    }),
  }).isRequired,
  params: PropTypes.shape({}),
  client: PropTypes.instanceOf(ApolloClient).isRequired,
};

export default withApollo(ResetPasswordPage);
