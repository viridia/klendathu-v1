import React, { PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import { LinkContainer } from 'react-router-bootstrap';
import AddBoxIcon from 'icons/ic_add_box_black_24px.svg';
import SignInLink from './signInLink.jsx';
import UserMenuButton from './userMenu.jsx';
import './header.scss';

export default function Header(props) {
  const { project } = props.params;
  return (<header className="kdt header">
    <span className="title">Klendathu</span>
    <span className="subtitle">
      <span> - </span>
      &ldquo;in order to <em>fight</em> the bug, we must <em>understand</em> the bug.&rdquo;
    </span>
    {project && (<LinkContainer
        to={{
          pathname: `/project/${project}/new`,
          state: { back: props.location },
        }}>
      <Button bsStyle="primary"><AddBoxIcon />New Issue...</Button>
    </LinkContainer>)}
    <SignInLink {...props} />
    <UserMenuButton {...props} />
  </header>);
}

Header.propTypes = {
  params: PropTypes.shape({
    // project: React.PropTypes.string.isRequired,
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};
