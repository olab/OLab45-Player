// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import { LinearProgress, Button } from '@material-ui/core';
import { ReactComponent as LogoIcon } from '../../shared/assets/icons/olab4_logo.svg';
import { Logo, HeaderWrapper, FakeProgress, CenterPlaceholder, VersionWrapper } from './styles';

const Header = ({ version, authActions, isScreenBusy }) => (
  <HeaderWrapper>
    <div>
      <Link to={`${process.env.PUBLIC_URL}/`} className="route-link">
        <Logo>
          <LogoIcon />
          <h1>OLab4</h1>
        </Logo>
      </Link>
      <CenterPlaceholder>
        &nbsp;
      </CenterPlaceholder>
      <VersionWrapper>
        User: {authActions.getUserName()}<br/>
        V{version}
      </VersionWrapper>
      {!authActions.isExternalToken() &&
        <Button
          variant="outlined"
          color="primary"
          size="large"
          aria-label="Return to Home"
          onClick={() => { authActions.logout(); }}
        >
          &nbsp;Logout&nbsp;
        </Button>
      }
    </div>
    {isScreenBusy ? <LinearProgress /> : <FakeProgress />}
  </HeaderWrapper>
);

export default Header;

