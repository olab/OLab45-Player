import TurkTalk from './turktalk';
import log from 'loglevel';
var constants = require('./constants');
const persistantStorage = require('../utils/StateStorage').PersistantStateStorage;

class Turker extends TurkTalk {

  // *****
  constructor(component) {

    super(component);

    const { onAtriumUpdate, onAddTurkee, onRemoveTurkey, onRoomAssigned } = component;
    this.onAtriumUpdate = onAtriumUpdate;
    this.onRoomAssigned = onRoomAssigned;
    this.onAddTurkee = onAddTurkee;
    this.onRemoveTurkey = onRemoveTurkey;
    this.playerState = component.props.props;

    // this.onAssignTurkee = this.onAssignLearner.bind(this);
    this.onCommandCallback = this.onCommandCallback.bind(this);
    this.onDisconnected = this.onDisconnected.bind(this);

    this.bindConnectionMessage();

  }

  // *****
  bindConnectionMessage() {

    super.bindConnectionMessage()
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

    // get room name to persistant storage in case 
    // user refreshes the window
    let roomName = this.penName;
    let moderator = persistantStorage.get('connectionInfo');
    if (moderator != null) {
      roomName = moderator.roomName
    }

    log.debug(`'${this.connectionId}' registering turker for room name: ${roomName}`);

    clientObject.connection.send(
      constants.SIGNALCMD_REGISTERTURKER,
      this.component.props.props.map.id,
      roomName,
      false);
  }

  // *****
  onDisconnected() {

    try {
      log.debug(`'${this.connectionId}' onDisconnected`);
      if (this.component.onConnectionChanged) {

        // clear out session id
        persistantStorage.save('ttalk_sessionId');

        if (this.component.onConnectionChanged) {
          this.component.onConnectionChanged({
            connection: this.connection.connection,
            Name: this.username
          });
        }
      }

    } catch (error) {
      log.error(`'${this.connectionId}' onDisconnected exception: ${error.message}`);
    }

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
      log.debug(`'${this.connectionId}' onReconnected: ${connectionId}`);
      if (this.component.onConnectionChanged) {
        this.component.onConnectionChanged({
          connectionStatus: this.connection._connectionState,
          ConnectionId: this.connectionId,
          Name: this.username
        });
      }
    } catch (error) {
      log.error(`'${this.connectionId}' onReconnected exception: ${error.message}`);
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

      else {
        log.debug(`'${this.connectionId}' onCommandCallback unknown command: '${payload.command}'`);
      }

    } catch (error) {
      log.error(`'${this.connectionId}' onCommandCallback exception: ${error.message}`);
    }

  }

};

export default Turker;
