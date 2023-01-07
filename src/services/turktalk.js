import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import log from 'loglevel';
import { config } from '../config';

var constants = require('./constants');
const persistantStorage = require('../utils/StateStorage').PersistantStateStorage;

class TurkTalk {

  // *****
  constructor(component) {

    this.component = component;
    this.contextId = component.props.props.contextId;

    this.type = this.constructor.name;
    const url = config.TTALK_HUB_URL;

    log.debug(`turk talk url: ${url}`);

    const sessionInfo = persistantStorage.get('sessionInfo');
    const token = `${sessionInfo?.authInfo.token}`;
    const hubUrl = `${url}?access_token=${token}&contextId=${this.contextId}`;
    
    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      // .withUrl(url, { accessTokenFactory: () => this.token })
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

  async disconnect() {
    await this.connection.stop();
    console.log('disconnection');
  }

  // *****
  connect(clientObject) {

    this.connection.start()
      .then(function () {

        if (clientObject?.onConnected) {
          // call onConnected method on 'derived' class
          clientObject.onConnected(clientObject);
        }
        
      })
      .catch(function (error) {
        console.error(error.message);
      });
  }

  onCommandCallback(payload) {

    if (payload.Command === constants.SIGNALCMD_CONNECTIONSTATUS) {
      const { Id } = payload.Data;
      log.debug(`Id: ${Id}`);

      if (this.component.onSessionIdChanged) {
        this.component.onSessionIdChanged(Id);
      }

      persistantStorage.save('ttalk_sessionId', Id);
    }

    return false;
  }

};

export default TurkTalk;