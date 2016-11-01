import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { withApollo } from 'react-apollo';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import ApolloClient from 'apollo-client';
import { LinkContainer } from 'react-router-bootstrap';
import axios from 'axios';
import Header from '../common/header.jsx';
import './login.scss';

/** Component which is displayed when the user has an incomplete signup as a result of social
    login. */
class FinishSignUpPage extends React.Component {
  constructor() {
    super();
    this.state = {
      userName: '',
      userNameError: null,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeUserName = this.onChangeUserName.bind(this);
  }

  onSubmit(ev) {
    ev.preventDefault();
    axios.post('finishsignup', {
      username: this.state.userName,
    }).then(resp => {
      const errState = {
        userNameError: null,
      };
      switch (resp.data.err) {
        case 'username-too-short':
          errState.userNameError = 'User name must be at least 6 characters.';
          break;
        case 'username-lower-case':
          errState.userNameError = 'User name cannot contain capital letters.';
          break;
        case 'user-exists': errState.userNameError = 'User name not available.'; break;
        default: {
          this.props.client.resetStore();
          const { next } = this.props.location.state;
          browserHistory.push(next || { pathname: '/' });
          return;
        }
      }
      this.setState(errState);
    }, reason => {
      console.error('signup error:', reason);
    });
  }

  onChangeUserName(e) {
    this.setState({ userName: e.target.value });
  }

  render() {
    const { next } = this.props.location.state;
    return (<div className="kdt page">
      <Header location={this.props.location} params={this.props.params} />
      <div className="login-content">
        <div className="login-spacer-before" />
        <div className="login card">
          <form className="finish-signup-form" onSubmit={this.onSubmit}>
            <header>Finish Account Creation</header>
            <FormGroup controlId="name" validationState={this.state.userNameError && 'error'}>
              <ControlLabel>Choose a unique user name:</ControlLabel>
              <FormControl
                  type="text"
                  autoFocus
                  value={this.state.userName}
                  placeholder="Choose a user name"
                  onChange={this.onChangeUserName} />
              <FormControl.Feedback />
              <HelpBlock>{this.state.userNameError}</HelpBlock>
            </FormGroup>
            <div className="button-row">
              <LinkContainer to={next || { pathname: '/' }}>
                <Button bsStyle="default">Cancel</Button>
              </LinkContainer>
              <Button bsStyle="primary" type="submit">Save</Button>
            </div>
          </form>
        </div>
        <div className="login-spacer-after" />
      </div>
    </div>);
  }
}

FinishSignUpPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      next: PropTypes.object,
    }),
  }).isRequired,
  params: PropTypes.shape({}),
  client: PropTypes.instanceOf(ApolloClient).isRequired,
};

export default withApollo(FinishSignUpPage);
