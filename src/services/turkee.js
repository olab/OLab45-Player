import { Log, LogInfo, LogError } from "../utils/Logger";
import log from "loglevel";
import SignalRWrapper from "../services/signalRWrapper";
var constants = require("./constants");

class Turkee {
  // *****
  constructor(component) {
    this.session = component.state.session;
    this.session.referringNode = component.props.props.node.title;
    this.session.nodeId = component.props.props.node.id;
    this.session.mapId = component.props.props.map.id;

    // this.bindConnectionMessage(this.connection);
    // this.onDisconnected = this.onDisconnected.bind(this);
    this.playerState = component.props.props;

    this.accessToken = component.props.props.authActions.getToken();
    this.contextId = component.props.props.contextId;

    this.signalr = new SignalRWrapper();
  }

  // *****
  async connect() {
    await this.signalr.connect(this);

    LogInfo(
      `'${this.connection.connectionId}' onConnected: connection succeeded`
    );

    log.debug(
      `'${this.connectionId}' registering turkee for session: ${JSON.stringify(
        this.session,
        null,
        1
      )}`
    );

    this.signalr.send(constants.SIGNALCMD_REGISTERTURKEE, this.session);
  }

  disconnect() {}

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
      log.error(`'${connectionId}' onReconnected exception: ${error.message}`);
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

      if (payload.command === constants.SIGNALCMD_MODERATOR_STATUS) {
        if (this.component.onModeratorStatus) {
          this.component.onModeratorStatus(payload.data);
        }

        return true;
      } else {
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
