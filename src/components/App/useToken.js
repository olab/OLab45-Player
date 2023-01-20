import { useState } from 'react';
import jwt_decode from "jwt-decode";
const persistantStorage = require('../../utils/StateStorage').PersistantStateStorage;

export default function useToken() {

  const getRole = () => {
    const sessionInfo = persistantStorage.get( null, 'sessionInfo');
    return sessionInfo?.role
  };

  const setUserName = (userName) => {
    const sessionInfo = persistantStorage.get( null, 'sessionInfo');
    sessionInfo.userName = userName;
    persistantStorage.save( null, 'sessionInfo', sessionInfo);
  }

  const getUserName = () => {
    const sessionInfo = persistantStorage.get( null, 'sessionInfo');
    return sessionInfo?.userName
  }

  const isExternalToken = () => {
    const sessionInfo = persistantStorage.get( null, 'sessionInfo');
    return sessionInfo?.isExternalToken;
  };

  const getToken = () => {
    const sessionInfo = persistantStorage.get( null, 'sessionInfo');
    return sessionInfo?.authInfo.token
  };

  const saveToken = (loginInfo, isExternalToken) => {

    let authInfo = loginInfo.authInfo;

    var decoded = jwt_decode(authInfo.token);
    console.log(decoded);

    let sessionInfo = persistantStorage.get( null, 'sessionInfo');
    sessionInfo = loginInfo;

    const expiry = new Date(decoded.exp * 1000);
    sessionInfo.authInfo.expires = expiry;
    sessionInfo.isExternalToken = isExternalToken;

    persistantStorage.save( null, 'sessionInfo', sessionInfo);

    setToken(sessionInfo.authInfo);
    setUserName(decoded.sub);
  };

  const session = () => {
    const authInfoObject = persistantStorage.get( null, 'sessionInfo');
    return authInfoObject;
  };

  const logout = () => {

    initializeState(true);

    let url = `${process.env.PUBLIC_URL}/`;
    window.location.href = url;
  };

  const initializeState = (clear = true) => {

    if (clear) {
      persistantStorage.clear();
    }

    // initialize debug/diagnostic flags
    if (!persistantStorage.get( null, 'debug')) {
      persistantStorage.save( null, 'debug', {
        enableWikiRendering: true,
        disableCache: false
      });
    }

    if (!persistantStorage.get( null, 'visit-once-nodes')) {
      persistantStorage.save( null, 'visit-once-nodes', []);
    }

    if (!persistantStorage.get( null, 'sessionInfo')) {
      persistantStorage.save( null, 'sessionInfo', { authInfo: { expires: 0 } });
    }

  }

  const isExpiredSession = () => {
    const { authInfo: { expires } } = persistantStorage.get( null, 'sessionInfo');
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
      setUserName: setUserName
    },

    session: sessionInfo
  }
}