import { useState } from "react";
import jwt_decode from "jwt-decode";
import log from "loglevel";
const playerState = require("../../utils/PlayerState").PlayerState;

export default function useToken() {
  const getRole = () => {
    const { role } = playerState.GetSessionInfo(null);
    return role;
  };

  const setUserName = (userName) => {
    const sessionInfo = playerState.GetSessionInfo(null);
    sessionInfo.userName = userName;
    playerState.SetSessionInfo(null, sessionInfo);
  };

  const getUserName = () => {
    const { userName } = playerState.GetSessionInfo(null);
    return userName;
  };

  const isExternalToken = () => {
    const { isExternalToken } = playerState.GetSessionInfo(null);
    return isExternalToken;
  };

  const getToken = () => {
    const {
      authInfo: { token },
    } = playerState.GetSessionInfo(null);
    return token;
  };

  const saveToken = (loginInfo, isExternalToken) => {
    let authInfo = loginInfo.authInfo;

    var decoded = jwt_decode(authInfo.token);
    log.debug(decoded);

    let sessionInfo = playerState.GetSessionInfo(null);
    sessionInfo = loginInfo;

    const expiry = new Date(decoded.exp * 1000);
    sessionInfo.authInfo.expires = expiry;
    sessionInfo.isExternalToken = isExternalToken;

    playerState.SetSessionInfo(null, sessionInfo);

    setToken(sessionInfo.authInfo);
    setUserName(decoded.sub);
  };

  const session = () => {
    const authInfoObject = playerState.GetSessionInfo(null);
    return authInfoObject;
  };

  const logout = () => {
    initializeState(true);

    let url = `${process.env.PUBLIC_URL}/`;
    window.location.href = url;
  };

  const initializeState = (clear = true) => {
    if (clear) {
      playerState.clear();
    }
  };

  const isExpiredSession = () => {
    const {
      authInfo: { expires },
    } = playerState.GetSessionInfo(null);
    const expiryDate = new Date(expires);
    const now = new Date();
    return expiryDate < now;
  };

  initializeState(false);

  const [sessionInfo] = useState(session());
  const [token, setToken] = useState(getToken());

  return {
    token,
    authActions: {
      isExpiredSession: isExpiredSession,
      isExternalToken: isExternalToken,
      setToken: saveToken,
      getToken: getToken,
      getRole: getRole,
      logout: logout,
      getUserName: getUserName,
      setUserName: setUserName,
    },

    session: sessionInfo,
  };
}
