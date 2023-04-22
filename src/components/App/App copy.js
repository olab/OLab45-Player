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
  loginExternalUserAsync,
  loginAnonymousUserAsync,
} from "../../services/api";

function App() {
  const { authActions } = useToken();
  const reactVersion = process.env.REACT_APP_VERSION;

  log.debug(JSON.stringify(process.env));

  // tests if external login (direct to a map and
  // comes with it's own access token)
  const searchParams = new URLSearchParams(document.location.search);
  const queryToken = searchParams.get("token");

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

  const submitExternalToken = async (token) => {
    try {
      let data = await loginExternalUserAsync(token);
      data.statusCode = 200;
      return data;
    } catch (error) {
      return { statusCode: 500, message: error.message };
    }
  };

  const submitAnonymousMapId = async (mapId) => {
    try {
      let data = await loginAnonymousUserAsync(mapId);
      data.statusCode = 200;
      return data;
    } catch (error) {
      return { statusCode: 500, message: error.message };
    }
  };

  const [mapId, nodeId] = processUrl();

  const [state, setState] = useState({
    token: queryToken,
    isExternal: queryToken != null,
    externalLoginStatus: null,
    mapId: mapId,
    nodeId: nodeId,
  });

  useEffect(() => {
    if (!state.token) {
      // try and get access token from querystring first
      if (state.isExternal) {
        submitExternalToken(state.token).then((data) => {
          if (data) {
            if (data.statusCode != 200) {
              log.error(`Error on externalLogin ${JSON.stringify(data)}`);
              setState({ ...data, externalLoginStatus: false });
            } else {
              authActions.setToken(data, true);
              setState({
                ...data,
                token: authActions.getToken(),
                externalLoginStatus: true,
              });
            }
          }
        });
      }

      // test if loading an anonymous map
      else {
        if (state.mapId != null && state.nodeId != null) {
          submitAnonymousMapId(state.mapId).then((data) => {
            if (data) {
              if (data.statusCode != 200) {
                log.error(`Error on testMapAnonymous ${JSON.stringify(data)}`);
                setState({ ...data, externalLoginStatus: false });
              } else {
                if (data.authInfo.token) {
                  setIsExternal(true);
                  authActions.setToken(data, true);
                  setState({
                    ...data,
                    isExternal: true,
                    token: authActions.getToken(),
                    externalLoginStatus: true,
                  });
                }
              }
            }
          });
        }
      }

      log.debug(`useEffect: token: ${authActions.getToken()}`);
    }
  }, [token, authActions]);

  processUrl(window.location.pathname);

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
            <Route
              path={`/player/:mapId/:nodeId`}
              element={<Player authActions={authActions} />}
            />
            <Route path="*" element={<NoMatch />} />
          </Routes>
        </div>
      );
    } else {
      if (externalLoginStatus == false) {
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
