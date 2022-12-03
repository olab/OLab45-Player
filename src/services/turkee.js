import TurkTalk from './turktalk';
import log from 'loglevel';
var constants = require('./constants');
const persistantStorage = require('../utils/StateStorage').PersistantStateStorage;

class Turkee extends TurkTalk {

  // *****
  constructor(component) {

    super(component);
    this.bindConnectionMessage(this.connection);
    this.onDisconnected = this.onDisconnected.bind(this);
    this.playerState = component.props.props;
    this.penName = `${component.props.props.map.name}|${component.props.name}`;
  }

  // *****
  bindConnectionMessage() {

    super.bindConnectionMessage();
    var self = this;

    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { self.onCommandCallback(payload) });
  }

  // *****
  connect(username) {
    this.username = username;
    super.connect(this);
  }

  // *****
  onConnected(clientObject) {

    log.info(`onConnected: connection succeeded.  Id = '${this.connection.connectionId}'`);

    this.connectionId = this.connection.connectionId;

    this.connection.onclose(clientObject.onDisconnected);
    this.connection.onreconnecting(clientObject.onReconnecting);
    this.connection.onreconnected(clientObject.onReconnected);

    if (this.component.onConnectionChanged) {
      this.component.onConnectionChanged({
        connectionStatus: this.connection._connectionState,
        ConnectionId: this.connectionId,
        Name: this.username
      });
    }

    // save room name to persistant storage in case 
    // user refreshes the window    
    let roomName = this.penName;
    const connectionInfo = persistantStorage.get('connectionInfo');
    if ( connectionInfo != null ) {
      roomName = connectionInfo.roomName;
    }

    clientObject.connection.send(
      constants.SIGNALCMD_REGISTERTURKEE,
      roomName);
  }

  onReconnecting(error) {
    try {
      log.debug(`onReconnecting: ${error}`);
      if (this.component.onConnectionChanged) {
        this.component.onConnectionChanged({
          connectionStatus: this.connection._connectionState,
          ConnectionId: this.connectionId,
          Name: this.username
        });
      }
    } catch (error) {
      log.error(`onReconnecting exception: ${error.message}`);
    }
  }

  onReconnected(connectionId) {
    try {
      log.debug(`onReconnected: ${connectionId}`);
      if (this.component.onConnectionChanged) {
        this.component.onConnectionChanged({
          connectionStatus: this.connection._connectionState,
          ConnectionId: this.connectionId,
          Name: this.username
        });
      }
    } catch (error) {
      log.error(`onReconnected exception: ${error.message}`);
    }
  }

  // *****
  onDisconnected() {

    try {
      log.debug(`onDisconnected`);
      if (this.component.onConnectionChanged) {

        // clear out session id
        persistantStorage.save('ttalk_sessionId');

        this.component.onConnectionChanged({
          connectionStatus: this.connection._connectionState,
          ConnectionId: '',
          Name: this.username
        });
      }

    } catch (error) {
      log.error(`onDisconnected exception: ${error.message}`);
    }

  }

  // *****
  onCommandCallback(payload) {

    try {

      log.debug(`onCommandCallback: ${payload.command}, ${JSON.stringify(payload.data, null, 2)}]`);

      // test if command NOT handled in base class
      if (super.onCommandCallback(payload)) {
        return;
      }

      if (payload.command === constants.SIGNALCMD_ROOMASSIGNED) {

        if (this.component.onRoomAssigned) {
          this.component.onRoomAssigned(payload.data);
        }

        return true;
      }

      if (payload.command === constants.SIGNALCMD_MODERATOR_REMOVED) {

        if (this.component.onModeratorRemoved) {
          this.component.onModeratorRemoved(payload.data);
        }

        return true;
      }

      else if (payload.command === constants.SIGNALCMD_ATRIUMASSIGNED) {

        if (this.component.onAtriumAssigned) {
          this.component.onAtriumAssigned(payload.data);
        }

        return true;
      }

      else {
        log.error(`onCommandCallback unknown command: '${payload.command}'`);
      }

    } catch (error) {
      log.error(`onCommandCallback exception: ${error.message}`);
    }

  }

};

export default Turkee;
