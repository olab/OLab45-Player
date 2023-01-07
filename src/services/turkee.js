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

    log.info(`'${this.connection.connectionId}' onConnected: connection succeeded`);

    this.connectionId = this.connection.connectionId.slice(-3);

    this.connection.onclose(clientObject.onDisconnected);
    this.connection.onreconnecting(clientObject.onReconnecting);
    this.connection.onreconnected(clientObject.onReconnected);

    if (this.component.onConnectionChanged) {
      this.component.onConnectionChanged({
        connectionStatus: this.connection._connectionState,
        connectionId: this.connectionId,
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

    log.debug(`'${this.connectionId}' registering learner for room name: ${roomName}`);

    clientObject.connection.send(
      constants.SIGNALCMD_REGISTERTURKEE,
      roomName);
  }

  onReconnecting(error) {
    try {
      log.debug(`'${this.connectionId}' onReconnecting: ${error}`);
      if (this.component.onConnectionChanged) {
        this.component.onConnectionChanged({
          connectionStatus: this.connection._connectionState,
          ConnectionId: this.connectionId,
          Name: this.username
        });
      }
    } catch (error) {
      log.error(`'${this.connectionId}' onReconnecting exception: ${error.message}`);
    }
  }

  onReconnected(connectionId) {
    try {
      log.debug(`'${connectionId}' onReconnected`);
      if (this.component.onConnectionChanged) {
        this.component.onConnectionChanged({
          connectionStatus: this.connection._connectionState,
          ConnectionId: this.connectionId,
          Name: this.username
        });
      }
    } catch (error) {
      log.error(`'${connectionId}' onReconnected exception: ${error.message}`);
    }
  }

  // *****
  onDisconnected() {

    try {

      if ( !this?.component?.componentMounted ) {
        return;
      }

      log.debug(`'${this.connectionId}' onDisconnected`);

      if (this?.component?.onConnectionChanged) {

        // clear out session id
        persistantStorage.save('ttalk_sessionId');

        this.component.onConnectionChanged({
          connectionStatus: this.connection._connectionState,
          connectionId: '',
          Name: this.username
        });
      }

    } catch (error) {
      log.error(`'${this.connectionId}' onDisconnected exception: ${error.message}`);
    }

  }

  // *****
  onCommandCallback(payload) {

    try {

      log.debug(`'${this.connectionId}' onCommandCallback: ${payload.command}`);

      // test if command NOT handled in base class
      if (super.onCommandCallback(payload)) {
        return;
      }

      // if (payload.command === constants.SIGNALCMD_ROOMASSIGNED) {

      //   if (this.component.onRoomAssigned) {
      //     this.component.onRoomAssigned(payload.data);
      //   }

      //   return true;
      // }

      if (payload.command === constants.SIGNALCMD_MODERATOR_STATUS) {

        if (this.component.onModeratorStatus) {
          this.component.onModeratorStatus(payload.data);
        }

        return true;
      }

      // else if (payload.command === constants.SIGNALCMD_ATRIUMASSIGNED) {

      //   if (this.component.onAtriumAssigned) {
      //     this.component.onAtriumAssigned(payload.data);
      //   }

      //   return true;
      // }

      else {
        log.debug(`'${this.connectionId}' onCommandCallback unknown command: '${payload.command}'`);
      }

    } catch (error) {
      log.error(`'${this.connectionId}' onCommandCallback exception: ${error.message}`);
    }

  }

};

export default Turkee;
