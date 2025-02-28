import { useState } from "react";
import jwt_decode from "jwt-decode";
import log from "loglevel";

// const playerState = require("../../utils/PlayerState").PlayerState;
import { PlayerState } from "../../utils/PlayerState";
const playerState = new PlayerState();

import { config } from "../../config";

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
      isSuperUser: this.isSuperUser,
    };
  }

  isSuperUser = () => {
    const role = this.getRole();
    if (!role) {
      return false;
    }
    return role.includes("olab:superuser");
  };

  getRole = () => {
    const { role } = PlayerState.GetSessionInfo();
    return role;
  };

  setUserName = (userName) => {
    const sessionInfo = PlayerState.GetSessionInfo();
    sessionInfo.userName = userName;
    PlayerState.SetSessionInfo(sessionInfo);
  };

  getUserName = () => {
    const { userName } = PlayerState.GetSessionInfo();
    return userName;
  };

  getTokenType = () => {
    const sessionInfo = PlayerState.GetSessionInfo();
    const { tokenType } = sessionInfo;
    return tokenType;
  };

  getToken = () => {
    const {
      authInfo: { token },
    } = PlayerState.GetSessionInfo();
    return token;
  };

  saveToken = (loginInfo, tokenType) => {
    let authInfo = loginInfo.authInfo;

    var decoded = jwt_decode(authInfo.token);
    log.debug(`Token decoded: ${JSON.stringify(decoded, null, 2)}`);

    let sessionInfo = PlayerState.GetSessionInfo();
    sessionInfo = loginInfo;

    const expiry = new Date(decoded.exp * 1000);
    sessionInfo.authInfo.expires = expiry;
    sessionInfo.tokenType = tokenType;

    PlayerState.SetSessionInfo(sessionInfo);

    log.debug(`Saving session info: ${JSON.stringify(sessionInfo, null, 2)}`);

    this.token = sessionInfo.authInfo;
    this.userName = decoded.sub;
  };

  session = () => {
    const authInfoObject = PlayerState.GetSessionInfo();
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
    } = PlayerState.GetSessionInfo();
    const expiryDate = new Date(expires);
    const now = new Date();
    return expiryDate < now;
  };

  clearState = () => {
    PlayerState.clear();
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
