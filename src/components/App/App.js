import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Home from "../Home/Home";
import Header from "../Header/Header";
import Login from "../Login/Login";
import { Log, LogInfo, LogError } from "../../utils/Logger";
import log from "loglevel";
import Player from "../Player/Player";
import useToken from "./useToken";
import { config } from "../../constants";
import {
  loginAnonymousUserAsync,
  loginExternalUserAsync,
} from "../../services/api";

function App() {
  const { authActions } = useToken();
  const [token, setToken] = useState(authActions.getToken());
  const reactVersion = process.env.REACT_APP_VERSION;

  log.debug(JSON.stringify(process.env));

  // tests if external login (direct to a map and
  // comes with it's own access token)
  const searchParams = new URLSearchParams(document.location.search);
  const queryToken = searchParams.get("token");
  const isExternal = queryToken != null;
  const [externalLoginStatus, setExternalLoginStatus] = useState(null);
  const [anonymousPlay, setAnonymousPlay] = useState(null);

  function processUrl() {
    let mapId = null;
    let nodeId = null;

    const urlParts = window.location.pathname.split("/");
    if (urlParts.length == 4) {
      mapId = urlParts[2];
      if (isNaN(mapId)) {
        mapId = null;
      } else {
        mapId = Number(mapId);
      }

      nodeId = urlParts[3];
      if (isNaN(nodeId)) {
        nodeId = null;
      } else {
        nodeId = Number(nodeId);
      }

      return [mapId, nodeId];
    }

    return [null, null];
  }

  const [mapId, nodeId] = processUrl();
  const directPlay = mapId != null && nodeId != null;

  useEffect(() => {
    const submitAnonymousMapId = async (mapId) => {
      try {
        let data = await loginAnonymousUserAsync(mapId);
        data.statusCode = 200;
        return data;
      } catch (error) {
        return { statusCode: 500, message: error.message };
      }
    };

    const submitExternalToken = async (queryToken) => {
      try {
        let data = await loginExternalUserAsync(queryToken);
        data.statusCode = 200;
        return data;
      } catch (error) {
        return { statusCode: 500, message: error.message };
      }
    };

    if (!token) {
      // try and get access token from querystring first
      if (queryToken) {
        let accessToken = submitExternalToken(queryToken).then((data) => {
          if (data) {
            if (data.statusCode != 200) {
              log.error(`Error on submitExternalToken ${JSON.stringify(data)}`);
              setExternalLoginStatus(null);
            } else {
              authActions.setToken(data, true);
              setExternalLoginStatus(true);
            }
          }
        });
      } else if (directPlay) {
        let accessToken = submitAnonymousMapId(mapId).then((data) => {
          if (data) {
            if (data.statusCode != 200) {
              log.error(`Error on submitAnonymousPlay ${JSON.stringify(data)}`);
              setExternalLoginStatus(null);
            } else {
              authActions.setToken(data, true);
              setAnonymousPlay(true);
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

  // test for external login or direct anon play, which has very limited routes
  if (directPlay && (externalLoginStatus || anonymousPlay)) {
    // need non-expired external token in order to invoke Player
    if (token && !isExpired) {
      return (
        <div className="wrapper">
          <Header version={reactVersion} authActions={authActions} />
          <Routes>
            <Route
              path={`/player/:mapId/:nodeId`}
              element={<Player authActions={authActions} />}
            />
            <Route path="*" element={<NoMatch />} />
          </Routes>
        </div>
      );
    } else {
      if (externalLoginStatus === false) {
        return <Login message="Login failed" authActions={authActions} />;
      }

      return <></>;
    }
  }

  if (!token || isExpired) {
    return <Login authActions={authActions} />;
  }

  return (
    <div className="wrapper">
      <Header version={reactVersion} authActions={authActions} />
      <Routes>
        <Route path={`/player`} element={<Home authActions={authActions} />} />
        <Route
          path={`/player/home`}
          element={<Home authActions={authActions} />}
        />
        <Route
          path={`/player/:mapId/:nodeId`}
          element={<Player authActions={authActions} />}
        />
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
