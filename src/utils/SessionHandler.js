// @flow
import log from 'loglevel';
const persistantStorage = require('./StateStorage').PersistantStateStorage;
const mapIdKey = 'mapId',
      sessionIdKey = 'sessionId';

class SessionHandler {

    isInSession = () => {
        var inSession = ( persistantStorage.get(sessionIdKey) != null );
        log.info(`in session?  ${inSession}`);
        return inSession;
    }

    startSession = ( mapId, sessionId ) => {

        persistantStorage.save(sessionIdKey, sessionId );
        log.info(`starting session for mapId = ${mapId}. sessionId = ${sessionId}`);
    }

    endSession = () => {

        log.info(`terminating session for sessionId = ${this.isInSession()}`);
        persistantStorage.save(mapIdKey, null );

    }

    getSessionId = () => {
        return persistantStorage.get(sessionIdKey);
    }

}

export default new SessionHandler();

