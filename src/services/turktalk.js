import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import log from "loglevel";
import { config } from "../config";
import SignalRWrapper from "./signalRWrapper";
var constants = require("./constants");
const playerState = require("../utils/PlayerState").PlayerState;

class TurkTalk {
  constructor(component) {
    this.component = component;
    this.contextId = component.props.props.contextId;
    this.type = this.constructor.name;

    const url = config.TTALK_HUB_URL;
    log.debug(`TurkTalk hub base url: ${url}`);

    this.questionSettings = JSON.parse(
      this.component.props.props.question.settings,
    );

    this.penName = `${component.props.props.map.name}|${this.questionSettings.roomName}`;

    const sessionInfo = playerState.GetSessionInfo(null);
    const token = `${sessionInfo?.authInfo.token || ""}`;

    const hubUrl =
      `${url}?access_token=${token}` +
      `&contextId=${this.contextId}` +
      `&mapId=${this.component.props.props.map.id}`;

    log.debug(`TurkTalk building connection to hub: ${hubUrl}`);

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.serverTimeoutInMilliseconds = 120000;
    if (config?.SIGNALR_TIMEOUT_MS) {
      this.connection.serverTimeoutInMilliseconds = Number(
        config.SIGNALR_TIMEOUT_MS,
      );
    }

    this.signalr = new SignalRWrapper({ connection: this.connection });
    this.connections = [];

    this.heartbeatInterval = null;
    this.isDisconnecting = false;
    this.isConnected = false;

    this.broadcastMessageCallback = this.broadcastMessageCallback.bind(this);
    this.onInternalClosed = this.onInternalClosed.bind(this);
    this.onInternalReconnected = this.onInternalReconnected.bind(this);
    this.onInternalReconnecting = this.onInternalReconnecting.bind(this);

    this.bindConnectionMessage();
    this.bindLifecycleHandlers();
    this.registerBrowserLifecycleHandlers();
  }

  async connect(clientObject) {
    log.debug("[TurkTalk] connect() called");

    try {
      await this.connection.start();
      this.isConnected = true;

      log.debug(
        "[TurkTalk] Connected to SignalR hub, connectionId:",
        this.connection.connectionId,
      );

      this.startHeartbeat();

      if (clientObject?.onConnected) {
        clientObject.onConnected();
      }
    } catch (err) {
      log.error("[TurkTalk] Connect failed:", err);
    }
  }

  bindConnectionMessage() {
    this.connection.on(
      constants.SIGNALCMD_BROADCAST,
      this.broadcastMessageCallback,
    );
  }

  bindLifecycleHandlers() {
    this.connection.onreconnecting(this.onInternalReconnecting);
    this.connection.onreconnected(this.onInternalReconnected);
    this.connection.onclose(this.onInternalClosed);
  }

  broadcastMessageCallback(message) {
    log.debug(`[TurkTalk] broadcastMessageCallback:`, message);
  }

  clearHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  async disconnect() {
    log.debug("[TurkTalk] manual disconnect requested");
    this.gracefulDisconnect("manual");
  }

  gracefulDisconnect(reason) {
    if (this.isDisconnecting) return;
    this.isDisconnecting = true;

    log.debug(`[TurkTalk] gracefulDisconnect triggered by: ${reason}`);

    // No controller/beacon: rely on heartbeat + OnDisconnectedAsync + cleanup service
    this.stopConnection()
      .then(() => log.debug("[TurkTalk] gracefulDisconnect stop completed"))
      .catch((err) =>
        log.error("[TurkTalk] gracefulDisconnect stop error:", err),
      );
  }

  onCommand(payload) {
    if (payload.Command === constants.SIGNALCMD_CONNECTIONSTATUS) {
      const { Id } = payload.Data;
      log.debug(`[TurkTalk] ConnectionStatus Id: ${Id}`);

      if (this.component.onSessionIdChanged) {
        this.component.onSessionIdChanged(Id);
      }

      return true;
    }

    return false;
  }

  onInternalClosed(error) {
    log.debug("[TurkTalk] SignalR closed:", error);
    this.isConnected = false;
    this.clearHeartbeat();
  }

  onInternalReconnected(connectionId) {
    log.debug("[TurkTalk] SignalR reconnected:", connectionId);
    this.isConnected = true;
  }

  onInternalReconnecting(error) {
    log.debug("[TurkTalk] SignalR reconnecting:", error);
  }

  registerBrowserLifecycleHandlers() {
    window.addEventListener("pagehide", () =>
      this.gracefulDisconnect("pagehide"),
    );

    window.addEventListener("beforeunload", () =>
      this.gracefulDisconnect("beforeunload"),
    );
  }

  startHeartbeat() {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(() => {
      if (this.connection.state === "Connected") {
        try {
          this.connection.invoke("Heartbeat", this.contextId, this.penName);
        } catch (err) {
          log.error("[TurkTalk] Heartbeat invoke failed:", err);
        }
      }
    }, 5000);
  }

  async stopConnection() {
    this.clearHeartbeat();

    if (!this.connection) return;

    try {
      await this.connection.stop();
      log.debug("[TurkTalk] SignalR connection stopped");
    } catch (err) {
      log.error("[TurkTalk] SignalR stop() error:", err);
      throw err;
    } finally {
      this.isConnected = false;
    }
  }
}

export default TurkTalk;
