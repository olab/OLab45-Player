import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch, Redirect, useLocation } from 'react-router-dom';
import './App.css';
import Home from '../Home/Home';
import Header from '../Header/Header';
import Login from '../Login/Login';
import log from 'loglevel';
import Player from '../Player/Player';
import useToken from './useToken';
import { config } from '../../constants';

function App() {

  const { authActions } = useToken();
  const [token, setToken] = useState(0);

  useEffect(() => {

    async function processCookieAsync(cookies) {

      if (!cookies) {
        return null;
      }
      return await processCookieForTokenAsync(cookies);
    }

    if (!token) {

      log.debug(`useEffect: token: ${token}`);

      const localToken = authActions.getToken();
      if (localToken) {
        setToken(localToken);
      }
      else {
        processCookieAsync(document.cookie).then(tokenResponse => {
          if (tokenResponse) {
            authActions.setToken(tokenResponse, true);
            authActions.setUserName(tokenResponse.userName);
            // set the token in the component state
            setToken(authActions.getToken());
            // delete the external cookie
            document.cookie = `external_token=; domain=.olab.ca; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
          }
        }).catch(e => {
          console.log(e)
        });
      }
    }

  }, [token, authActions]);

  const isExpired = authActions.isExpiredSession();

  log.debug(`render: token: ${token}`);

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

function processCookieForTokenAsync(cookieString) {

  if (!cookieString) {
    log.debug(`No external cookies set`);
    return null;
  }

  var token = extractExternalToken(cookieString);
  if (!token) {
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

    log.debug(`parsing: '${cookieStr}')`);

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