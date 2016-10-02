import React from 'react';
import { browserHistory } from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import { LinkContainer } from 'react-router-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../common/header.jsx';
import { login } from '../../store/profile';
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
    this.props.login({
      username: this.state.userName,
      password: this.state.password,
    }).then(resp => {
      const errState = {
        userNameError: null,
        passwordError: null,
      };
      switch (resp.data.err) {
        case 'unknown-user': errState.userNameError = 'Unknown user.'; break;
        case 'incorrect-password': errState.passwordError = 'Incorrect password.'; break;
        default: {
          const { next } = this.props.location.query;
          browserHistory.push({ pathname: next || '/' });
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
    const { next } = this.props.location.query;
    return (<div className="kdt page">
      <Header location={this.props.location} params={this.props.params} />
      <div className="login-content">
        <div className="login-spacer-before" />
        <div className="login card">
          <form className="login-form" onSubmit={this.onSubmit}>
            <FormGroup controlId="userName" validationState={this.state.userNameError && 'error'}>
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
                  onChange={this.onChangePassword} />
              <FormControl.Feedback />
              <HelpBlock>{this.state.passwordError}</HelpBlock>
            </FormGroup>
            <div className="button-row">
              <LinkContainer to={{ pathname: '/signup', query: this.props.location.query }}>
                <Button bsStyle="link">Create Account</Button>
              </LinkContainer>
              <LinkContainer to={{ pathname: next || '/' }}>
                <Button bsStyle="default">Cancel</Button>
              </LinkContainer>
              <Button bsStyle="primary" type="submit" disabled={!canSubmit}>Sign In</Button>
            </div>
          </form>
          <div className="divider" />
          <div className="providers">
            <Button bsStyle="primary">Log in with Google</Button>
            <Button bsStyle="primary">Log in with Twitter</Button>
            <Button bsStyle="primary">Log in with Github</Button>
          </div>
        </div>
        <div className="login-spacer-after" />
      </div>
    </div>);
  }
}

LoginPage.propTypes = {
  location: React.PropTypes.shape({
    query: React.PropTypes.shape({
      next: React.PropTypes.string,
    }).isRequired,
  }).isRequired,
  login: React.PropTypes.func.isRequired,
  params: React.PropTypes.shape({}),
};

export default connect(
  (state) => ({
    user: state.profile,
  }),
  dispatch => bindActionCreators({ login }, dispatch),
)(LoginPage);
