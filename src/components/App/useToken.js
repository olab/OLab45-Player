import { useState } from "react";
import jwt_decode from "jwt-decode";
import log from "loglevel";
const playerState = require("../../utils/PlayerState").PlayerState;

class useToken {
  constructor() {
    this.#initializeState(false);
    this.authActions = {
      clearState: this.clearState,
      isExpiredSession: this.isExpiredSession,
      getTokenType: this.getTokenType,
      setToken: this.saveToken,
      getToken: this.getToken,
      getRole: this.getRole,
      logout: this.logout,
      getUserName: this.getUserName,
      setUserName: this.setUserName,
    };
  }

  getRole = () => {
    const { role } = playerState.GetSessionInfo(null);
    return role;
  };

  setUserName = (userName) => {
    const sessionInfo = playerState.GetSessionInfo(null);
    sessionInfo.userName = userName;
    playerState.SetSessionInfo(null, sessionInfo);
  };

  getUserName = () => {
    const { userName } = playerState.GetSessionInfo(null);
    return userName;
  };

  getTokenType = () => {
    const sessionInfo = playerState.GetSessionInfo(null);
    const { tokenType } = sessionInfo;
    return tokenType;
  };

  getToken = () => {
    const {
      authInfo: { token },
    } = playerState.GetSessionInfo(null);
    return token;
  };

  saveToken = (loginInfo, tokenType) => {
    let authInfo = loginInfo.authInfo;

    var decoded = jwt_decode(authInfo.token);
    log.debug(`Token decoded: ${JSON.stringify(decoded, null, 2)}`);

    let sessionInfo = playerState.GetSessionInfo(null);
    sessionInfo = loginInfo;

    const expiry = new Date(decoded.exp * 1000);
    sessionInfo.authInfo.expires = expiry;
    sessionInfo.tokenType = tokenType;

    playerState.SetSessionInfo(null, sessionInfo);

    log.debug(`Saving session info: ${JSON.stringify(sessionInfo, null, 2)}`);

    this.token = sessionInfo.authInfo;
    this.userName = decoded.sub;
  };

  session = () => {
    const authInfoObject = playerState.GetSessionInfo(null);
    return authInfoObject;
  };

  logout = (redirect = true) => {
    this.#initializeState(true);

    if (redirect) {
      let url = `${process.env.PUBLIC_URL}/`;
      window.location.href = url;
    }
  };

  isExpiredSession = () => {
    const {
      authInfo: { expires },
    } = playerState.GetSessionInfo(null);
    const expiryDate = new Date(expires);
    const now = new Date();
    return expiryDate < now;
  };

  clearState = () => {
    playerState.clear();
  };

  #initializeState = (clear = true) => {
    if (clear) {
      this.clearState();
    }

    this.token = null;
    this.userName = null;
  };
}

export default useToken;
