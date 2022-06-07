import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import log from 'loglevel';

var constants = require('./constants');

class TurkTalk {

  // *****
  constructor(component) {

    this.component = component;

    // const { onConnectionStatusChange } = component;
    // this.onConnectionStatusChange = onConnectionStatusChange;
    this.type = this.constructor.name;

    this.connection = new HubConnectionBuilder()
      .withUrl('https://localhost:5001/turktalk')
      // .withAutomaticReconnect()
      .configureLogging(LogLevel.Critical)
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
    return false;
  }

};

export default TurkTalk;