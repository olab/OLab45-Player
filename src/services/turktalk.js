import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import log from 'loglevel';
import { config } from '../config';

var constants = require('./constants');
const persistantStorage = require('../utils/StateStorage').PersistantStateStorage;

class TurkTalk {

  // *****
  constructor(component) {

    this.component = component;
    this.type = this.constructor.name;
    const url = config.TTALK_HUB_URL;

    this.connection = new HubConnectionBuilder()
      .withUrl(url)
      // .withAutomaticReconnect()
      .configureLogging(LogLevel.Error)
      .build();

    this.connections = [];
  }

  // *****
  bindConnectionMessage() {
    this.connection.on(constants.SIGNALCMD_BROADCAST, this.broadcastMessageCallback);
  }

  broadcastMessageCallback(message) {
    log.debug(`broadcastMessageCallback:`);
  }

  // *****
  connect(clientObject) {

    // var self = this;
    this.connection.start()
      .then(function () {
        // call onConnected method on 'derived' class
        clientObject.onConnected(clientObject);
      })
      .catch(function (error) {
        console.error(error.message);
      });
  }

  onCommandCallback(payload) {

    if (payload.Command === constants.SIGNALCMD_CONNECTIONSTATUS) {
      const { SessionId } = payload.Data;
      log.debug(`sessionId: ${SessionId}`);      

      if ( this.component.onSessionIdChanged ) {
        this.component.onSessionIdChanged( SessionId );
      }

      persistantStorage.save('ttalk_sessionId', SessionId );
      return true;
    }

    return false;
  }

};

export default TurkTalk;