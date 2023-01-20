// @flow
import log from 'loglevel';
const persistantStorage = require('./StateStorage').PersistantStateStorage;
const mapIdKey = 'mapId',
      sessionIdKey = 'sessionId';

class SessionHandler {

    isInSession = () => {
        var inSession = ( persistantStorage.get( null, sessionIdKey) != null );
        log.info(`in session?  ${inSession}`);
        return inSession;
    }

    startSession = ( mapId, sessionId ) => {

        persistantStorage.save( null, sessionIdKey, sessionId );
        log.info(`starting session for mapId = ${mapId}. sessionId = ${sessionId}`);
    }

    endSession = () => {

        log.info(`terminating session for sessionId = ${this.isInSession()}`);
        persistantStorage.save( null, mapIdKey, null );

    }

    getSessionId = () => {
        return persistantStorage.get( null, sessionIdKey);
    }

}

export default new SessionHandler();

