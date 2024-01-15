import TurkTalk from "./turktalk";
import { Log, LogInfo, LogError } from "../utils/Logger";
import log from "loglevel";
import { config } from "../config";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
const playerState = require("../utils/PlayerState").PlayerState;

let retryCount = 10;
if (config?.API_RETRY_COUNT) {
  retryCount = Number(config.API_RETRY_COUNT);
}

class SignalRWrapper {
  constructor() {
    this.connection = null;
    this.connectionId = null;
    this.userKey = null;
    this.onConnected = this.onConnected.bind(this);
    this.onNewConnection = this.onNewConnection.bind(this);
  }

  async connect(service) {
    this.service = service;

    var url = `${config.TTALK_HUB_URL}/negotiate?userid=${this.service.username}&accessToken=${this.service.accessToken}`;
    Log(`connect url: ${url}`);

    let settings = {
      method: "POST",
    };

    settings.signal = AbortSignal.timeout(10000);
    const response = await fetch(url, settings);
    let info = await response.json();

    Log(`negotiate payload: ${JSON.stringify(info)})`);

    // make compatible with old and new SignalRConnectionInfo
    info.accessToken = info.AccessToken || info.accessKey; // pay attention to the case
    info.url = info.Url || info.endpoint; // pay attention to the case
    info.url = `${info.url}&olab_access_token=${this.service.accessToken}`;

    const options = {
      accessTokenFactory: () => info.accessToken,
    };

    this.connection = new HubConnectionBuilder()
      .withUrl(info.url, options)
      .configureLogging(LogLevel.Information)
      .build();

    Log("connecting...");

    this.connection.on("newConnection", this.onNewConnection);

    this.connection
      .start()
      .then(() => {
        this.onConnected();
      })
      .catch(function (error) {
        LogError(error.message);
      });
  }

  onNewConnection(message) {
    this.userKey = message.UserKey;

    if (this.service?.onConnected) {
      this.service.onConnected(this.connection);
    }
  }

  onConnected() {
    try {
      this.connectionId = this.connection.connectionId;

      Log(`'${this.connectionId}' onConnected`);

      if (this.service?.onDisconnected) {
        this.connection.onclose(this.service.onDisconnected);
      }

      if (this.service?.onReconnecting) {
        this.connection.onreconnecting(this.service.onReconnecting);
      }

      if (this.service?.onReconnected) {
        this.connection.onreconnected(this.service.onReconnected);
      }
    } catch (error) {
      LogError(
        `'${this.connectionId}' onConnected exception: ${error.message}`
      );
    }
  }

  sendMessage(methodName, payload) {
    let tries = 5;

    do {
      try {
        Log(
          `send method '${methodName}' payload: (${JSON.stringify(
            payload,
            null,
            1
          )})`
        );

        this.connection.invoke(methodName, payload);

        Log(` send message ${methodName} result ${JSON.stringify(result)}`);

        return;
      } catch (error) {
        LogInfo(
          `exception ${error.message} invoking '${methodName}'.  Tries remaining: ${tries}`
        );
      }
    } while (tries-- >= 0);

    LogError(`error invoking '${methodName}'.  Max tries exceeded.`);
  }
}

export default SignalRWrapper;
