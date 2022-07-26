import React from 'react';
import { BrowserRouter, Route, Switch, Redirect, useLocation } from 'react-router-dom';
import './App.css';
import queryString from 'query-string';
import Home from '../Home/Home';
import Header from '../Header/Header';
import Login from '../Login/Login';
import Player from '../Player/Player';
import useToken from './useToken';

function App() {

  const { authActions } = useToken();

  // test for cookie that contains an
  // externally issued bearer token
  const externalToken = processExternalToken(document.cookie);
  if (externalToken) {
    let loginInfo = {
      token: externalToken,
      authInfo: {}
    };
    authActions.setToken(loginInfo);
  }
  else {
    const params = queryString.parse(window.location.search);
    let token = authActions.getToken();

    if (params.id_token && !token) {
      let authInfo = { token: params.id_token };
      authActions.setToken(authInfo);
    }
  }

  const isExpired = authActions.isExpiredSession();
  let token = authActions.getToken();

  if (!token || isExpired) {
    return <Login authActions={authActions} />
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

function processExternalToken(cookieStr) {

  return null; // "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdG5hbWUiOiJBZG1pbiIsImxhc3RuYW1lIjoiVXNlciIsImVtYWlsIjoidG9wcHNAdWNhbGdhcnkuY2EiLCJyb2xlcyI6Im9sYWJsZWFybmVyLG9sYWJhdXRob3Isb2xhYnN1cGVydXNlciIsIm1vb2RsZWlkIjoiMiIsImlhdCI6MTY1ODY5OTY2NywiZXhwIjoxNjU4ODcyNDY3LCJpc3MiOiJtb29kbGUifQ.UpDAGs-9swnw_zskLoOVZYx4rQfaZugSsDNktRYH12o";

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
    console.log(`Cookie: ${JSON.stringify(cookies, null, 2)}`);

    if ('external_token' in cookies) {
      console.log(`External token: ${cookies.external_token}`);
      return cookies.external_token;
    }

    return null;

  } catch (error) {
    console.log.error(error);
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