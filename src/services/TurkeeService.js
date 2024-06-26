import { Log, LogInfo, LogError } from "../utils/Logger";
import log from "loglevel";
import SignalRWrapper from "./signalRWrapper";
var constants = require("./constants");

class TurkeeService {
  // *****
  constructor(component) {
    this.questionId = this.extractQuestionId(component.props.props.id);
    this.nodeId = component.props.props.node.id;
    this.mapId = component.props.props.map.id;

    this.onDisconnected = this.onDisconnected.bind(this);
    this.onAuthenticated = this.onAuthenticated.bind(this);
    this.onReconnecting = this.onReconnecting.bind(this);
    this.onReconnected = this.onReconnected.bind(this);
    this.onAtriumAccepted = this.onAtriumAccepted.bind(this);

    this.accessToken = component.props.props.authActions.getToken();
    this.contextId = component.props.props.contextId;

    this.signalrWrapper = new SignalRWrapper();
    this.component = component;
  }

  extractQuestionId(prop) {
    let questionIdStr = prop.replace("QU-", "");
    return Number(questionIdStr);
  }

  // *****
  async connect() {
    await this.signalrWrapper.connect(this);
  }

  onError(message) {
    if (this.component.onError) {
      this.component.onError(message);
    }
  }

  async onAuthenticated(connection, payload) {
    this.connection = connection;
    this.userKey = payload.UserKey;
    this.localInfo = payload.Participant;

    if (this.connection != null) {
      this.connection.on("atriumaccepted", this.onAtriumAccepted);
      this.connection.on("roomaccepted", this.onRoomAccepted);

      // signal component of connection status
      if (this.component.onAuthenticated) {
        this.component.onAuthenticated();
      }

      let registerPayload = {
        contextId: this.contextId,
        mapId: this.mapId,
        nodeId: this.nodeId,
        questionId: this.questionId,
        userKey: this.userKey,
      };

      await this.signalrWrapper.sendMessageAsync(
        constants.SIGNALCMD_REGISTERLEARNER,
        registerPayload
      );

      if (this.onConnectionChanged) {
        this.onConnectionChanged({
          connectionStatus: this.signalrWrapper.connection._connectionState,
          connectionId: this.signalrWrapper.connection.connectionId,
        });
      }
    } else {
      LogError("unable to connect");
    }
  }

  onRoomAccepted(payload) {
    if (this.component.onRoomAccepted) {
      this.component.onRoomAccepted(payload);
    }
  }

  onAtriumAccepted(payload) {
    if (this.component.onAtriumAccepted) {
      this.component.onAtriumAccepted(payload);
    }
  }

  onDisconnecting() {}

  onReconnecting(error) {
    try {
      LogInfo(`'${this.connectionId}' onReconnecting: ${error}`);
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
      LogInfo(`'${connectionId}' onReconnected`);
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

      LogInfo(`'${this.connectionId}' onDisconnected`);

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
}

export default TurkeeService;
