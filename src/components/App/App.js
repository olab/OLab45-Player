import React, { useEffect, useState } from 'react';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Home from '../Home/Home';
import Header from '../Header/Header';
import Login from '../Login/Login';
import { Log, LogInfo, LogError } from '../../utils/Logger';
import Player from '../Player/Player';
import useToken from './useToken';
import { config } from '../../constants';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';

function WrapperPlayer( props ) {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  return <Player navigate={navigate} params={params} location={location} {...props} />
}

function App() {

  const { authActions } = useToken();
  const [token, setToken] = useState(0);

  console.log(JSON.stringify(process.env));

  useEffect(() => {

    async function processCookieAsync(cookies) {

      if (!cookies) {
        return null;
      }
      return await processCookieForTokenAsync(cookies);
    }

    if (!token) {

      Log(`useEffect: token: ${token}`);

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
  const reactVersion = process.env.REACT_APP_VERSION;

  Log(`render: token: ${token}`);

  if (!token || isExpired) {
    return <Login authActions={authActions} />
  }

  return (
    <div className="wrapper">
      <Header version={reactVersion} authActions={authActions} />
      <Routes>
        <Route path={`/player`} element={<Home authActions={authActions} />} />
        <Route path={`/player/home`} element={<Home authActions={authActions} />} />
        <Route path={`/player/player/:mapId/:nodeId`} element={<Player authActions={authActions} />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </div>
  );
}

function processCookieForTokenAsync(cookieString) {

  if (!cookieString) {
    Log(`No external cookies set`);
    return null;
  }

  var token = extractExternalToken(cookieString);
  if (!token) {
    return null;
  }

  let url = `${config.API_URL}/auth/loginexternal`;

  Log(`loginExternal(${token}) url: ${url})`);

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

    Log(`parsing: '${cookieStr}')`);

    const parseCookie = str =>
      str
        .split(';')
        .map(v => v.split('='))
        .reduce((acc, v) => {
          acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
          return acc;
        }, {});

    let cookies = parseCookie(cookieStr);
    Log(`Cookie: ${JSON.stringify(cookies, null, 2)}`);

    if ('external_token' in cookies) {
      Log(`External token: ${cookies.external_token}`);
      return cookies.external_token;
    }

    return null;

  } catch (error) {
    LogError(error);
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
