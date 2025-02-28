import TurkTalk from "./turktalk";
import { Log, LogInfo, LogError } from "../utils/Logger";
import log from "loglevel";
import { config } from "../config";

// const playerState = require("../utils/PlayerState").PlayerState;
import { PlayerState } from "../utils/PlayerState";
const playerState = new PlayerState();

let retryCount = 10;
if (config?.API_RETRY_COUNT) {
  retryCount = Number(config.API_RETRY_COUNT);
}

class SignalRWrapper {
  constructor(props) {
    this.connection = props.connection;
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
