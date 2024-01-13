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
  }

  async connect(data) {
    var url = `${config.TTALK_HUB_URL}/negotiate?userid=${data.username}&accessToken=${data.accessToken}`;

    let settings = {
      method: "POST",
    };

    settings.signal = AbortSignal.timeout(10000);
    const response = await fetch(url, settings);
    let info = await response.json();

    log.debug(`post payload: ${JSON.stringify(info)})`);

    // make compatible with old and new SignalRConnectionInfo
    info.accessToken = info.AccessToken || info.accessKey; // pay attention to the case
    info.url = info.Url || info.endpoint; // pay attention to the case
    info.url = `${info.url}&olab_access_token=${data.accessToken}`;

    const options = {
      accessTokenFactory: () => info.accessToken,
    };

    this.connection = new HubConnectionBuilder()
      .withUrl(info.url, options)
      .configureLogging(LogLevel.Information)
      .build();

    console.log("connecting...");
    this.connection
      .start()
      .then(() => {
        console.log("connected!");
      })
      .catch(console.error);
  }

  send(methodName, ...args) {
    let tries = retryCount;
    do {
      try {
        log.debug(
          `'send method '${methodName}' (${JSON.stringify(args, null, 1)})`
        );

        this.connection.send(methodName, ...args);
        return;
      } catch (error) {
        log.warn(
          `exception ${error.message} invoking ${methodName}.  Tries remaining: ${tries}`
        );
      }
    } while (tries-- >= 0);

    log.error(
      `exception ${error.message} invoking ${methodName}.  Max tries exceeded.`
    );
  }
}

export default SignalRWrapper;
