import TurkTalk from "./turktalk";
import { Log, LogInfo, LogError } from "../utils/Logger";
import log from "loglevel";

// var constants = require("./constants");
import constants from "./constants";

// const playerState = require("../utils/PlayerState").PlayerState;
import { PlayerState } from "../utils/PlayerState";
const playerState = new PlayerState();

class Turker extends TurkTalk {
  // *****
  constructor(component) {
    super(component);

    const {
      // onAtriumUpdate,
      onAddTurkee,
      onRemoveTurkey,
      onRoomAssigned,
    } = component;

    // this.onAtriumUpdate = onAtriumUpdate;
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
    super.bindConnectionMessage();
    var turkerSelf = this;

    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => {
      turkerSelf.onCommand(payload);
    });
  }

  // *****
  connect(username) {
    this.username = username;
    super.connect(this);
  }

  // *****
  onConnected() {
    LogInfo(
      `'${this.connection.connectionId}' onConnected: connection succeeded`
    );

    this.connectionId = this.connection.connectionId.slice(-3);

    this.connection.onclose(this.onDisconnected);
    this.connection.onreconnecting(this.onReconnecting);
    this.connection.onreconnected(this.onReconnected);

    if (this.component.onConnectionChanged) {
      this.component.onConnectionChanged({
        connectionStatus: this.connection._connectionState,
        connectionId: this.connectionId,
        Name: this.username,
      });
    }

    // get room name from persistant storage in case
    // user refreshes the window
    let roomName = this.penName;
    let moderator = PlayerState.GetConnectionInfo(null, null);
    if (moderator != null) {
      if (moderator.roomName) {
        roomName = moderator.roomName;
      }
    }

    log.debug(
      `'${this.connectionId}' registering turker for room name: ${roomName}`
    );

    this.signalr.send(
      constants.SIGNALCMD_REGISTERTURKER,
      this.component.props.props.map.id,
      this.component.props.props.node.id,
      roomName,
      false
    );
  }

  // *****
  onDisconnected() {
    try {
      log.warn(`'${this.connectionId}' onDisconnected`);
      if (this.component.onConnectionChanged) {
        if (this.component.onConnectionChanged) {
          this.component.onConnectionChanged({
            connection: this.connection.connection,
            Name: this.username,
          });
        }
      }
    } catch (error) {
      LogError(
        `'${this.connectionId}' onDisconnected exception: ${error.message}`
      );
    }
  }

  onReconnecting(error) {
    try {
      log.warn(`'${this.connectionId}' onReconnecting: ${error}`);
      if (this.component.onConnectionChanged) {
        this.component.onConnectionChanged({
          connectionStatus: this.connection._connectionState,
          ConnectionId: this.connectionId,
          Name: this.username,
        });
      }
    } catch (error) {
      LogError(
        `'${this.connectionId}' onReconnecting exception: ${error.message}`
      );
    }
  }

  onReconnected(connectionId) {
    try {
      log.warn(`'${this.connectionId}' onReconnected: ${connectionId}`);
      if (this.component.onConnectionChanged) {
        this.component.onConnectionChanged({
          connectionStatus: this.connection._connectionState,
          ConnectionId: this.connectionId,
          Name: this.username,
        });
      }
    } catch (error) {
      LogError(
        `'${this.connectionId}' onReconnected exception: ${error.message}`
      );
    }
  }

  // *****
  onCommand(payload) {
    try {
      log.debug(`'${this.connectionId}' onCommand: ${payload.command}`);

      // test if command NOT handled in base class
      if (super.onCommand(payload)) {
        return;
      } else {
        log.debug(
          `'${this.connectionId}' turker.js onCommand unknown command: '${payload.command}'`
        );
      }
    } catch (error) {
      LogError(
        `'${this.connectionId}' turker.js onCommand exception: ${error.message}`
      );
    }
  }
}

export default Turker;
