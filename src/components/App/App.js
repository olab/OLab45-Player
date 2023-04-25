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
import {
  processUrl,
  submitAnonymousMapId,
  submitExternalToken,
} from "../../utils/AppHelpers";
var constants = require("../../services/constants");
const playerState = require("../../utils/PlayerState").PlayerState;

function App() {
  const reactVersion = process.env.REACT_APP_VERSION;
  log.debug(JSON.stringify(process.env));

  const { authActions } = useToken();
  const [token, setToken] = useState(authActions.getToken());

  const searchParams = new URLSearchParams(document.location.search);
  const queryToken = searchParams.get("token");

  const [mapId, nodeId] = processUrl();
  const directPlay = mapId != null && nodeId != null;

  const tokenType = authActions.getTokenType();

  // perform any left-over anon/external token cleanup
  if (
    (tokenType == constants.TOKEN_TYPE_ANONYMOUS ||
      tokenType == constants.TOKEN_TYPE_EXTERNAL) &&
    !directPlay
  ) {
    log.info(`logging out previous anonymous session`);
    authActions.logout();
  }

  // catch any maps changes under previous anon/external session
  if (
    tokenType == constants.TOKEN_TYPE_ANONYMOUS ||
    tokenType == constants.TOKEN_TYPE_EXTERNAL
  ) {
    const map = playerState.GetMap();
    if (map && map?.id != mapId) {
      log.info(`logging out anonymous session from different map`);
      authActions.logout();
    }
  }

  const [externalPlay, setExternalPlay] = useState(null);
  const [anonymousPlay, setAnonymousPlay] = useState(
    tokenType == constants.TOKEN_TYPE_ANONYMOUS
  );
  const [directPlayError, setDirectPlayError] = useState(
    tokenType == constants.TOKEN_TYPE_EXTERNAL
  );

  useEffect(() => {
    const anonymousMapCheck = (data) => {
      if (data) {
        if (data.error_code != 200) {
          log.error(`Error on submitAnonymousPlay ${JSON.stringify(data)}`);
          setDirectPlayError(data.data);
          setToken(null);
        } else {
          authActions.setToken(data.data, constants.TOKEN_TYPE_ANONYMOUS);
          setAnonymousPlay(true);
        }
      }
    };

    const externalTokenCheck = (data) => {
      if (data) {
        if (data.statusCode != 200) {
          log.error(`Error on submitExternalToken ${JSON.stringify(data)}`);
          setDirectPlayError(data.message);
        } else {
          authActions.setToken(data, constants.TOKEN_TYPE_EXTERNAL);
          setExternalPlay(true);
        }
      }
    };

    log.debug(`useEffect: token: ${token ? token.slice(-3) : "none"}`);
    log.debug(`           directPlay: ${directPlay}`);
    log.debug(`           externalPlay: ${externalPlay}`);
    log.debug(`           anonymousPlay: ${anonymousPlay}`);

    if (!token) {
      if (directPlay) {
        // process access token on querystring
        if (queryToken) {
          log.debug(`processing esternal token`);
          submitExternalToken(queryToken).then((data) => {
            externalTokenCheck(data);
          });

          // else the play has to be anonymous
        } else {
          log.debug(`processing anonymous play`);
          submitAnonymousMapId(mapId).then((data) => {
            anonymousMapCheck(data);
          });
        }
      }
    }

    const localToken = authActions.getToken();
    if (localToken) {
      setToken(localToken);
    }

    log.debug(`useEffect: token: ${authActions.getToken()}`);
  }, [token, authActions]);

  const isExpired = authActions.isExpiredSession();
  log.debug(`render: token: ${token ? token.slice(-3) : "none"}`);
  log.debug(`        directPlay: ${directPlay}`);
  log.debug(`        externalPlay: ${externalPlay}`);
  log.debug(`        anonymousPlay: ${anonymousPlay}`);

  if (directPlay && directPlayError) {
    return (
      <div>
        <Header version={reactVersion} />
        <center>
          <p>{directPlayError}</p>
        </center>
      </div>
    );
  }

  if (!token || isExpired) {
    return <Login authActions={authActions} />;
  }

  // test for external login or direct anon play, which has very limited routes
  if (directPlay && (externalPlay || anonymousPlay)) {
    // need non-expired external token in order to invoke Player
    if (token && !isExpired) {
      return (
        <div className="wrapper">
          <Header version={reactVersion} />
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
      return <></>;
    }
  }

  if (tokenType == constants.TOKEN_TYPE_NATIVE) {
    return (
      <div className="wrapper">
        <Header version={reactVersion} authActions={authActions} />
        <Routes>
          <Route
            path={`/player`}
            element={<Home authActions={authActions} />}
          />
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
  } else {
    return <></>;
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
