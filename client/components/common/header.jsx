import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import CloseIcon from '../../media/icons/ic_close_black_24px.svg';
import SignInLink from './signInLink.jsx';
import UserMenuButton from './userMenu.jsx';
import './header.scss';

export default function Header(props) {
  return (<div className="kdt header">
    <span className="title">Klendathu</span>
    <span className="subtitle">
      <span> - </span>
      &ldquo;in order to <em>fight</em> the bug, we must <em>understand</em> the bug.&rdquo;
    </span>
    <ButtonGroup>
      <Button bsStyle="primary"><CloseIcon />Create</Button>
      <Button bsStyle="primary">Primary</Button>
    </ButtonGroup>
    <SignInLink {...props} />
    <UserMenuButton {...props} />
  </div>);
}
