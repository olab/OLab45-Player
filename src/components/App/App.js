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

  // test for an externally issued cookie that
  // contains a bearer token
  // processExternalToken( document.cookie );

  const { authActions } = useToken();
  const params = queryString.parse(window.location.search);
  let token = authActions.getToken();

  if (params.id_token && !token) {
    let authInfo = { token: params.id_token };
    authActions.setToken(authInfo);
  }

  const isExpired = authActions.isExpiredSession();
  token = authActions.getToken();

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

function processExternalToken( cookieStr ) {

  try {
    const parseCookie = str =>
    str
      .split(';')
      .map(v => v.split('='))
      .reduce((acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
        return acc;
      }, {});

    let cookies = parseCookie( cookieStr );
    console.log(`Cookie: ${JSON.stringify( cookies, null, 2 )}`);    

    if ( 'external_token' in cookies ) {
      console.log(`Bearer token: ${cookies.external_token}`);   
       
    }
      
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