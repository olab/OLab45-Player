import TurkTalk from './turktalk';
import { Log, LogInfo, LogError } from '../utils/Logger';
var constants = require('./constants');
const playerState = require('../utils/PlayerState').PlayerState;

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
    this.onCommand = this.onCommand.bind(this);
    this.onDisconnected = this.onDisconnected.bind(this);

    this.bindConnectionMessage();

  }

  // *****
  bindConnectionMessage() {

    super.bindConnectionMessage()
    var turkerSelf = this;

    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { turkerSelf.onCommand(payload) });
  }

  // *****
  connect(username) {
    this.username = username;
    super.connect(this);
  }

  // *****
  onConnected(clientObject) {

    LogInfo(`'${this.connection.connectionId}' onConnected: connection succeeded`);

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
    let moderator = playerState.GetConnectionInfo( null );
    if (moderator != null) {
      roomName = moderator.roomName
    }

    Log(`'${this.connectionId}' registering turker for room name: ${roomName}`);

    clientObject.connection.send(
      constants.SIGNALCMD_REGISTERTURKER,
      this.component.props.props.map.id,
      this.component.props.props.node.id,
      roomName,
      false);
  }

  // *****
  onDisconnected() {

    try {
      Log(`'${this.connectionId}' onDisconnected`);
      if (this.component.onConnectionChanged) {

        if (this.component.onConnectionChanged) {
          this.component.onConnectionChanged({
            connection: this.connection.connection,
            Name: this.username
          });
        }
      }

    } catch (error) {
      LogError(`'${this.connectionId}' onDisconnected exception: ${error.message}`);
    }

  }

  onReconnecting(error) {
    try {
      Log(`'${this.connectionId}' onReconnecting: ${error}`);
      if (this.component.onConnectionChanged) {
        this.component.onConnectionChanged({
          connectionStatus: this.connection._connectionState,
          ConnectionId: this.connectionId,
          Name: this.username
        });
      }
    } catch (error) {
      LogError(`'${this.connectionId}' onReconnecting exception: ${error.message}`);
    }
  }

  onReconnected(connectionId) {
    try {
      Log(`'${this.connectionId}' onReconnected: ${connectionId}`);
      if (this.component.onConnectionChanged) {
        this.component.onConnectionChanged({
          connectionStatus: this.connection._connectionState,
          ConnectionId: this.connectionId,
          Name: this.username
        });
      }
    } catch (error) {
      LogError(`'${this.connectionId}' onReconnected exception: ${error.message}`);
    }
  }

  // *****
  onCommand(payload) {

    try {

      Log(`'${this.connectionId}' onCommand: ${payload.command}`);

      // test if command NOT handled in base class
      if (super.onCommand(payload)) {
        return;
      }      

      else {
        Log(`'${this.connectionId}' onCommand unknown command: '${payload.command}'`);
      }

    } catch (error) {
      LogError(`'${this.connectionId}' onCommand exception: ${error.message}`);
    }

  }

};

export default Turker;
