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
    this.penName = `${component.props.props.map.name}|${component.props.name}`;

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

    log.info(`onConnected: connection succeeded.  Id = '${this.connection.connectionId}'`);

    this.connectionId = this.connection.connectionId;

    this.connection.onclose(clientObject.onDisconnected);
    this.connection.onreconnecting(clientObject.onReconnecting);
    this.connection.onreconnected(clientObject.onReconnected);

    if (this.component.onConnectionChanged) {
      this.component.onConnectionChanged({
        connection: this.connection.connection,
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

    log.debug(`registering turker for room name: ${roomName}`);

    clientObject.connection.send(
      constants.SIGNALCMD_REGISTERTURKER,
      roomName,
      false);
  }

  // *****
  onDisconnected() {

    try {
      log.debug(`onDisconnected`);
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
      log.error(`onDisconnected exception: ${error.message}`);
    }

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
  onCommandCallback(payload) {

    try {

      log.debug(`onCommandCallback: ${payload.command}`);

      // test if command NOT handled in base class
      if (super.onCommandCallback(payload)) {
        return;
      }      

      else {
        log.debug(`onCommandCallback unknown command: '${payload.command}'`);
      }

    } catch (error) {
      log.error(`onCommandCallback exception: ${error.message}`);
    }

  }

};

export default Turker;
