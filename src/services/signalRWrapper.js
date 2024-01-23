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
    this.onConnected = this.onConnectionActive.bind(this);
    this.onAuthenticated = this.onAuthenticated.bind(this);
    this.sendMessageAsync = this.sendMessageAsync.bind(this);
    this.onError = this.onError.bind(this);
  }

  onError(message) {
    if (this.service.onError != null) {
      this.service.onError(message);
    }
  }

  async connect(service) {
    this.service = service;
    let info = {};

    try {
      var url = `${config.TTALK_HUB_URL}/negotiate?accessToken=${this.service.accessToken}`;
      Log(`connect url: ${url}`);

      try {
        let settings = {
          method: "POST",
        };

        // settings.signal = AbortSignal.timeout(10000);
        let response = await fetch(url, settings);
        info = await response.json();
      } catch (error) {
        LogError(error);
        throw new Error(`Connection error: cannot connect`);
      }

      // make compatible with old and new SignalRConnectionInfo
      info.accessToken = info.AccessToken || info.accessKey; // pay attention to the case
      info.url = info.Url || info.endpoint; // pay attention to the case
      info.url = `${info.url}&olab_access_token=${this.service.accessToken}&sessionId=${this.service.contextId}`;

      Log(`negotiate payload: ${JSON.stringify(info)})`);

      const options = {
        accessTokenFactory: () => info.accessToken,
      };

      this.connection = new HubConnectionBuilder()
        .withUrl(info.url, options)
        .configureLogging(LogLevel.Information)
        .build();

      Log("connecting...");

      this.connection
        .start()
        .then(() => {
          this.onConnectionActive();
        })
        .catch(function (error) {
          throw new Error(`Connection error: cannot start connection`);
        });
    } catch (error) {
      this.onError(error.message);
    }
  }

  onConnectionActive() {
    try {
      this.connectionId = this.connection.connectionId;

      Log(`'${this.connectionId}' onConnectionActive`);

      this.connection.on("onauthenticated", this.onAuthenticated);

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

  // turktalk authenticated method
  onAuthenticated(payload) {
    Log(`onAuthenticated payload: ${JSON.stringify(payload, null, 1)})`);

    if (this.service?.onAuthenticated) {
      this.service.onAuthenticated(this.connection, payload);
    }
  }

  async sendMessageAsync(methodName, payload) {
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

        await this.connection.invoke(methodName, payload);
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
