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

  useEffect(() => {

    // async function processCookieAsync(cookies) {

    //   if (!cookies) {
    //     return null;
    //   }
    //   return await processCookieForTokenAsync(cookies);
    // }

    if (!token) {

      log.debug(`useEffect: token: ${token}`);

      // try and get access token from querystring
      if (queryToken) {
        authActions.setToken({ authInfo: { token: queryToken } }, true);
        setToken(authActions.getToken());
      }

      // else try and get from authActions, which is set 
      // in the Login component
      else {

        const localToken = authActions.getToken();
        if (localToken) {
          setToken(localToken);
        }

        // else {

        //   processCookieAsync(document.cookie).then(tokenResponse => {
        //     if (tokenResponse) {
        //       authActions.setToken(tokenResponse, true);
        //       // set the token in the component state
        //       setToken(authActions.getToken());
        //       // delete the external cookie
        //       document.cookie = `external_token=; domain=.olab.ca; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        //     }
        //   }).catch(e => {
        //     console.log(e)
        //   });
        // }
      }
    }

  }, [token, authActions]);

  const isExpired = authActions.isExpiredSession();
  log.debug(`render: token: ${token}`);

  // test for external login, which has very limited routes
  if (isExternal) {

    // need non-expired external token in order to invoke Player
    if (token && !isExpired) {
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
