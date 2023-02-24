import TurkTalk from "./turktalk";
import { Log, LogInfo, LogError } from "../utils/Logger";
import log from "loglevel";
var constants = require("./constants");

const playerState = require("../utils/PlayerState").PlayerState;

class Turkee extends TurkTalk {
  // *****
  constructor(component) {
    super(component);

    this.session = component.state.session;
    this.bindConnectionMessage(this.connection);
    this.onDisconnected = this.onDisconnected.bind(this);
    this.playerState = component.props.props;
  }

  // *****
  bindConnectionMessage() {
    super.bindConnectionMessage();
    var turkeeSelf = this;

    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => {
      turkeeSelf.onCommand(payload);
    });
  }

  // *****
  connect(username) {
    this.username = username;
    super.connect(this);
  }

  // *****
  onConnected(clientObject) {
    LogInfo(
      `'${this.connection.connectionId}' onConnected: connection succeeded`
    );

    this.connectionId = this.connection.connectionId.slice(-3);

    this.connection.onclose(clientObject.onDisconnected);
    this.connection.onreconnecting(clientObject.onReconnecting);
    this.connection.onreconnected(clientObject.onReconnected);

    if (this.component.onConnectionChanged) {
      this.component.onConnectionChanged({
        connectionStatus: this.connection._connectionState,
        connectionId: this.connectionId,
        Name: this.username,
      });
    }

    // get room name from persistant storage in case
    // user refreshes the window
    this.session.roomName = this.penName;
    let learner = playerState.GetConnectionInfo(null);
    if (learner != null) {
      if (learner.roomName) {
        this.session.roomName = learner.roomName;
      }
    }

    log.debug(
      `'${this.connectionId}' registering turker for session: ${JSON.stringify(
        this.session,
        null,
        1
      )}`
    );

    clientObject.connection.send(
      constants.SIGNALCMD_REGISTERTURKEE,
      this.session
    );
  }

  onReconnecting(error) {
    try {
      log.debug(`'${this.connectionId}' onReconnecting: ${error}`);
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
      log.debug(`'${connectionId}' onReconnected`);
      if (this.component.onConnectionChanged) {
        this.component.onConnectionChanged({
          connectionStatus: this.connection._connectionState,
          ConnectionId: this.connectionId,
          Name: this.username,
        });
      }
    } catch (error) {
      LogError(`'${connectionId}' onReconnected exception: ${error.message}`);
    }
  }

  // *****
  onDisconnected() {
    try {
      if (!this?.component?.componentMounted) {
        return;
      }

      log.debug(`'${this.connectionId}' onDisconnected`);

      if (this?.component?.onConnectionChanged) {
        this.component.onConnectionChanged({
          connectionStatus: this.connection._connectionState,
          connectionId: "",
          Name: this.username,
        });
      }
    } catch (error) {
      LogError(
        `'${this.connectionId}' onDisconnected exception: ${error.message}`
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
        log.debug(
          `'${this.connectionId}' onCommand unknown command: '${payload.command}'`
        );
      }
    } catch (error) {
      LogError(`'${this.connectionId}' onCommand exception: ${error.message}`);
    }
  }
}

export default Turkee;
