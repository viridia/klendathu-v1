import React, { PropTypes } from 'react';
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
import AlertDialog from '../common/alertDialog.jsx';
import './login.scss';

class RecoverPasswordPage extends React.Component {
  constructor() {
    super();
    this.state = {
      email: '',
      emailError: null,
      showMessage: false,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onHideMessage = this.onHideMessage.bind(this);
  }

  onSubmit(ev) {
    ev.preventDefault();
    axios.post('recoverpw', {
      email: this.state.email,
    }).then(resp => {
      const errState = {
        emailError: null,
      };
      if (resp.data.err) {
        console.log(resp.data.err);
        switch (resp.data.err) {
          case 'invalid-email': errState.emailError = 'Invalid email address.'; break;
          case 'send-error': errState.emailError = 'Error: email could not be sent.'; break;
          default: {
            errState.emailError = `Unknown error: ${resp.err}.`;
            break;
          }
        }
        this.setState(errState);
      } else {
        this.setState({ showMessage: true, emailError: null });
      }
    }, reason => {
      console.error('recover password error:', reason);
    });
  }

  onChangeEmail(e) {
    this.setState({ email: e.target.value });
  }

  onHideMessage() {
    this.setState({ showMessage: false });
  }

  render() {
    const canSubmit = this.state.email.length > 3;
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
            Send a password recovery email.
            <FormGroup controlId="email" validationState={this.state.emailError && 'error'}>
              <ControlLabel>Enter Email Address</ControlLabel>
              <FormControl
                  type="text"
                  value={this.state.email}
                  placeholder="Enter email address"
                  onChange={this.onChangeEmail} />
              <FormControl.Feedback />
              <HelpBlock>{this.state.emailError}</HelpBlock>
            </FormGroup>
            <div className="button-row">
              <LinkContainer to={{ ...this.props.location, pathname: '/login' }}>
                <Button bsStyle="link">Back to Sign In</Button>
              </LinkContainer>
              <Button bsStyle="primary" type="submit" disabled={!canSubmit}>Send Email</Button>
            </div>
          </form>
        </div>
        <div className="login-spacer-after" />
      </div>
    </div>);
  }
}

RecoverPasswordPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      next: PropTypes.object,
    }),
  }).isRequired,
  params: PropTypes.shape({}),
  client: PropTypes.instanceOf(ApolloClient).isRequired,
};

export default withApollo(RecoverPasswordPage);
