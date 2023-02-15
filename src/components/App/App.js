import React, { useEffect, useState } from 'react';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Home from '../Home/Home';
import Header from '../Header/Header';
import Login from '../Login/Login';
import { Log, LogInfo, LogError } from '../../utils/Logger';
import log from 'loglevel';
import Player from '../Player/Player';
import useToken from './useToken';
import { config } from '../../constants';
import { loginExternalUserAsync } from '../../services/api';

function App() {

  const { authActions } = useToken();
  const [token, setToken] = useState(0);
  const reactVersion = process.env.REACT_APP_VERSION;

  console.log(JSON.stringify(process.env));

  // tests if external login (direct to a map and
  // comes with it's own access token)
  const searchParams = new URLSearchParams(document.location.search);
  const queryToken = searchParams.get("token");
  const isExternal = (queryToken != null);
  const [externalLoginStatus, setExternalLoginStatus] = useState(null);

  useEffect(() => {

    if (!token) {

      const submitExternalToken = async (queryToken) => {
        let data = await loginExternalUserAsync(queryToken);
        return data;
      }

      // try and get access token from querystring first
      if (queryToken) {

        let accessToken = submitExternalToken(queryToken)
          .then((data) => {
            if (data) {
              if (data.statusCode != 200) {
                log.error(`Error on externalLogin ${JSON.stringify(data)}`);
                setExternalLoginStatus(false);
              }
              else {
                authActions.setToken({ authInfo: { token: data.authInfo.token } }, true);
                setExternalLoginStatus(true);
              }
            }
          });
      }

      const localToken = authActions.getToken();
      if (localToken) {
        setToken(localToken);
      }

      log.debug(`useEffect: token: ${authActions.getToken()}`);

    }

  }, [token, authActions]);

  const isExpired = authActions.isExpiredSession();
  log.debug(`render: token: ${token}`);

  // test for external login, which has very limited routes
  if (isExternal) {

    // need non-expired external token in order to invoke Player
    if (token && !isExpired && externalLoginStatus) {
      return (
        <div className="wrapper">
          <Header version={reactVersion} authActions={authActions} />
          <Routes>
            <Route path={`/player/player/:mapId/:nodeId`} element={<Player authActions={authActions} />} />
            <Route path="*" element={<NoMatch />} />
          </Routes>
        </div>
      );
    }
    else {
      if ( externalLoginStatus == false ) {
        return <Login message="Login failed" authActions={authActions} />
      }

      return (<></>);      
    }
  }

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

// function processCookieForTokenAsync(cookieString) {

//   if (!cookieString) {
//     log.debug(`No external cookies set`);
//     return null;
//   }

//   var token = extractExternalToken(cookieString);
//   if (!token) {
//     return null;
//   }

//   let url = `${config.API_URL}/auth/loginexternal`;

//   log.debug(`loginExternal(${token}) url: ${url})`);

//   var body = {
//     "ExternalToken": token
//   };

//   return fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(body)
//   })
//     .then(
//       data => data.json()
//     )

// }

// function extractExternalToken(cookieStr) {

//   try {

//     log.debug(`parsing: '${cookieStr}')`);

//     const parseCookie = str =>
//       str
//         .split(';')
//         .map(v => v.split('='))
//         .reduce((acc, v) => {
//           acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
//           return acc;
//         }, {});

//     let cookies = parseCookie(cookieStr);
//     log.debug(`Cookie: ${JSON.stringify(cookies, null, 2)}`);

//     if ('external_token' in cookies) {
//       log.debug(`External token: ${cookies.external_token}`);
//       return cookies.external_token;
//     }

//     return null;

//   } catch (error) {
//     LogError(error);
//   }
// }

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
