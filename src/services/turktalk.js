import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { Log, LogInfo, LogError } from "../utils/Logger";
import log from "loglevel";
import { config } from "../config";
import SignalRWrapper from "./signalRWrapper";

var constants = require("./constants");
const playerState = require("../utils/PlayerState").PlayerState;

class TurkTalk {
  // *****
  constructor(component) {
    this.component = component;
    this.contextId = component.props.props.contextId;

    this.type = this.constructor.name;
    const url = config.TTALK_HUB_URL;

    log.debug(`turk talk url: ${url}`);

    this.questionSettings = JSON.parse(
      this.component.props.props.question.settings,
    );
    this.penName = `${component.props.props.map.name}|${this.questionSettings.roomName}`;

    const sessionInfo = playerState.GetSessionInfo(null);
    const token = `${sessionInfo?.authInfo.token}`;
    const hubUrl = `${url}?access_token=${token}&contextId=${this.contextId}&mapId=${this.component.props.props.map.id}`;

    log.debug(`building connection to hub`);

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.serverTimeoutInMilliseconds = 120000;

    if (config?.SIGNALR_TIMEOUT_MS) {
      this.connection.serverTimeoutInMilliseconds = Number(
        config?.SIGNALR_TIMEOUT_MS,
      );
    }

    this.signalr = new SignalRWrapper({ connection: this.connection });

    this.connections = [];

    this.handlePageHide = this.handlePageHide.bind(this);
    window.addEventListener("pagehide", this.handlePageHide);
    log.debug("added pageHide");
  }

  handlePageHide() {
    try {
      // Direct call to stop() skips framework overhead to complete before context dies
      this.connection.stop();
      log.debug(`page hide: stopping connection`);
    } catch (err) {
      log.error("Failed to disconnect SignalR on navigation:", err);
    }
  }

  // *****
  bindConnectionMessage() {
    this.connection.on(
      constants.SIGNALCMD_BROADCAST,
      this.broadcastMessageCallback,
    );
  }

  broadcastMessageCallback(message) {
    log.debug(`broadcastMessageCallback:`);
  }

  async disconnect() {
    window.removeEventListener("pagehide", this.handlePageHide);

    await this.connection.stop();
    log.debug("removing pageHide");
  }

  // *****
  connect(clientObject) {
    this.connection
      .start()
      .then(function () {
        if (clientObject?.onConnected) {
          // call onConnected method on 'derived' class
          clientObject.onConnected();
        }
      })
      .catch(function (error) {
        console.error(error.message);
      });
  }

  onCommand(payload) {
    if (payload.Command === constants.SIGNALCMD_CONNECTIONSTATUS) {
      const { Id } = payload.Data;
      log.debug(`Id: ${Id}`);

      if (this.component.onSessionIdChanged) {
        this.component.onSessionIdChanged(Id);
      }
    }

    return false;
  }
}

export default TurkTalk;
