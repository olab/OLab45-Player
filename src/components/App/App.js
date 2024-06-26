import { PureComponent } from "react";
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Home from "../Home/Home";
import Header from "../Header/Header";
import Login from "../Login/Login";
import log from "loglevel";
import Player from "../Player/Player";
import useToken from "./useToken";
import {
  processUrl,
  submitAnonymousMapId,
  submitExternalToken,
} from "../../utils/AppHelpers";
import Logout from "./../Logout/";
import MapSessions from "../Sessions/Sessions";
import { config } from "../../config";

var constants = require("../../services/constants");
const playerState = require("../../utils/PlayerState").PlayerState;

class App extends PureComponent {
  constructor(props) {
    super(props);

    this.reactVersion = process.env.REACT_APP_VERSION;
    log.debug(JSON.stringify(process.env));

    const [mapId, nodeId, accessToken] = processUrl();
    const directPlay = mapId != null && nodeId != null;

    const { authActions } = new useToken();
    const tokenType = authActions.getTokenType();

    log.info(`current token type: ${tokenType}`);

    // perform any left-over anon/external token cleanup
    if (accessToken) {
      log.info(`external token found. logging out previous session`);
      authActions.clearState();
    }

    // catch any map changes under previous anon/external session
    if (
      tokenType == constants.TOKEN_TYPE_ANONYMOUS ||
      tokenType == constants.TOKEN_TYPE_EXTERNAL
    ) {
      let map = playerState.GetMap();

      if (map && map?.id != mapId) {
        log.info(`map changed. logging out previous session`);
        authActions.clearState();
      }
    }

    this.state = {
      authActions: authActions,
      token: authActions.getToken(),
      tokenType: authActions.getTokenType(),
      externalPlay: tokenType == constants.TOKEN_TYPE_EXTERNAL,
      anonymousPlay: tokenType == constants.TOKEN_TYPE_ANONYMOUS,
      directPlayError: null,
      directPlay: directPlay,
      isMounted: false,
    };

    this.setCredentials = this.setCredentials.bind(this);
  }

  anonymousMapCheck = (data) => {
    const { authActions } = this.state;
    if (data) {
      if (data.error_code != 200) {
        log.error(`Error on anonymousMapCheck ${JSON.stringify(data)}`);
        this.setState({ token: null, directPlayError: data.message });
      } else {
        authActions.setToken(data.data, constants.TOKEN_TYPE_ANONYMOUS);
        this.setState({ token: authActions.getToken(), anonymousPlay: true });
      }
    }
  };

  externalTokenCheck = (data) => {
    const { authActions } = this.state;
    if (data) {
      if (data.statusCode != 200) {
        log.error(`Error on externalTokenCheck ${JSON.stringify(data)}`);
        this.setState({ token: null, directPlayError: data.message });
      } else {
        authActions.setToken(data.data, constants.TOKEN_TYPE_EXTERNAL);
        this.setState({
          isMounted: true,
          token: authActions.getToken(),
          externalPlay: true,
        });
      }
    }
  };

  setCredentials = (authInfo, userName, tokenType) => {
    const { authActions } = this.state;
    authActions.setToken(authInfo, tokenType);
    this.setState({
      token: authActions.getToken(),
      tokenType: authActions.getTokenType(),
    });
  };

  evaluatePlayType() {
    let { token, directPlay, authActions } = this.state;
    const isExpired = authActions.isExpiredSession();

    if (!token) {
      if (directPlay) {
        const searchParams = new URLSearchParams(document.location.search);
        const queryToken = searchParams.get("token");
        // process access token on querystring (external play)
        if (queryToken) {
          log.debug(`processing external token`);
          submitExternalToken(queryToken).then((data) => {
            this.externalTokenCheck(data);
          });

          // else the play has to be anonymous
        } else {
          log.debug(`processing anonymous play`);
          const [mapId] = processUrl();
          submitAnonymousMapId(mapId).then((data) => {
            this.anonymousMapCheck(data);
          });
        }
      }
    }
  }

  componentDidMount() {
    this.evaluatePlayType();
  }

  render() {
    let {
      isMounted,
      token,
      directPlay,
      authActions,
      externalPlay,
      anonymousPlay,
      tokenType,
      directPlayError,
    } = this.state;
    const isExpired = authActions.isExpiredSession();

    if (!token || isExpired) {
      return (
        <Login setCredentials={this.setCredentials} authActions={authActions} />
      );
    }

    if (directPlay && directPlayError) {
      return (
        <div>
          <Header
            version={this.reactVersion}
            authActions={authActions}
            externalPlay={externalPlay}
          />
          <center>
            <p>{directPlayError}</p>
          </center>
        </div>
      );
    }

    // if direct-to-node play and external or anon login, expose limited routes
    if (directPlay && (externalPlay || anonymousPlay)) {
      // need non-expired external token in order to invoke Player
      if (token && !isExpired) {
        return (
          <div className="wrapper">
            <Header
              version={this.reactVersion}
              authActions={authActions}
              externalPlay={externalPlay}
            />
            <Routes>
              <Route
                path={`${config.APP_BASEPATH}/:mapId/sessions`}
                element={<MapSessions authActions={authActions} />}
              />
              <Route
                path={`${config.APP_BASEPATH}/:mapId/:nodeId`}
                element={<Player authActions={authActions} />}
              />
              <Route
                path={`${config.APP_BASEPATH}/logout`}
                element={<Logout authActions={authActions} />}
              />
              <Route path="*" element={<NoMatch />} />
            </Routes>
          </div>
        );
      } else {
        return <></>;
      }
    }

    // handle 'regular' user routes
    if (tokenType == constants.TOKEN_TYPE_NATIVE) {
      return (
        <div className="wrapper">
          <Header
            version={this.reactVersion}
            authActions={authActions}
            externalPlay={externalPlay}
          />
          <Routes>
            <Route
              path={`${config.APP_BASEPATH}`}
              element={<Home authActions={authActions} />}
            />
            <Route
              path={`${config.APP_BASEPATH}/home`}
              element={<Home authActions={authActions} />}
            />
            <Route
              path={`${config.APP_BASEPATH}/:mapId/sessions`}
              element={<MapSessions authActions={authActions} />}
            />
            <Route
              path={`${config.APP_BASEPATH}/:mapId/:nodeId`}
              element={<Player authActions={authActions} />}
            />
            <Route
              path={`${config.APP_BASEPATH}/logout`}
              element={<Logout authActions={authActions} />}
            />
            <Route path="*" element={<NoMatch />} />
          </Routes>
        </div>
      );
    } else {
      return <></>;
    }
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
