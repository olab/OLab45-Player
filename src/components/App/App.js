import React from 'react';
import { BrowserRouter, Route, Switch, Redirect, useLocation } from 'react-router-dom';
import './App.css';
import queryString from 'query-string';
import Home from '../Home/Home';
import Header from '../Header/Header';
import Login from '../Login/Login';
import log from 'loglevel';
import Player from '../Player/Player';
import useToken from './useToken';
import { config } from '../../constants';

function App() {

  const { authActions } = useToken();
  const params = queryString.parse(window.location.search);
  let token = authActions.getToken();

  if (params.id_token && !token) {
    let authInfo = { token: params.id_token };
    authActions.setToken(authInfo);
  }

  // test for external login
  let externalLoginResponse = loginExternalAsync( document.cookie );

  if ( externalLoginResponse ) {
    authActions.setToken(externalLoginResponse);
    authActions.setUserName(externalLoginResponse.userName);    
  }
  else {
    const isExpired = authActions.isExpiredSession();
    token = authActions.getToken();

    if (!token || isExpired) {
      return <Login authActions={authActions} />
    }    
  }
 
  return (
    <div className="wrapper">
      <BrowserRouter>
        <Header authActions={authActions} />
        <Switch>
          <Route exact path={`${process.env.PUBLIC_URL}/`} render={() => {
            return (
              <Redirect to={`${process.env.PUBLIC_URL}/home`} />
            )
          }}
          />
          <Route path={`${process.env.PUBLIC_URL}/home`}>
            <Home authActions={authActions} />
          </Route>
          <Route path={`${process.env.PUBLIC_URL}/:mapId/:nodeId/:param?`}>
            <Player authActions={authActions} />
          </Route>
          <Route path="*">
            <NoMatch />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

function loginExternalAsync( cookieString ) {

  if ( !cookieString ) {
    log.debug(`No external cookies set`);
    return null;
  }

  var token = extractExternalToken( cookieString );
  if ( !token ) {
    return null;
  }

  let url = `${config.API_URL}/auth/loginexternal`;

  log.debug(`loginExternal(${token}) url: ${url})`);

  var body = {
    "ExternalToken": token
  };

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
    .then(
      data => data.json()
    )
  
}

function extractExternalToken(cookieStr) {

  try {

    const parseCookie = str =>
      str
        .split(';')
        .map(v => v.split('='))
        .reduce((acc, v) => {
          acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
          return acc;
        }, {});

    let cookies = parseCookie(cookieStr);
    log.debug(`Cookie: ${JSON.stringify(cookies, null, 2)}`);

    if ('external_token' in cookies) {
      log.debug(`External token: ${cookies.external_token}`);
      return cookies.external_token;
    }

    return null;

  } catch (error) {
    log.error(error);
  }
}

function NoMatch() {
  let location = useLocation();

  return (
    <div>
      <h4>
        Page not found <code>{location.pathname}</code>
      </h4>
    </div>
  );
}

export default App;