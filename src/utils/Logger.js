import log from "loglevel";

function getErrorObject() {
  try {
    throw Error("");
  } catch (err) {
    return err;
  }
}

const LogEnable = () => {
  log.enableAll();
};

const getLocation = () => {
  var err = getErrorObject();
  var caller_line = err.stack.split("\n")[4];
  var index = caller_line.indexOf("at ");
  var location = caller_line.slice(index + 2, caller_line.length);
  return location;
};

const LogException = (message, error) => {
  log.error(`ERR: ${message} at ${JSON.stringify(error, null, 2)}`);
};

const LogError = (message) => {
  try {
    var err = getErrorObject();
    var caller_line = err.stack.split("\n")[4];
    var index = caller_line.indexOf("at ");
    var location = caller_line.slice(index + 2, caller_line.length);
    log.error(`ERR: ${message} at ${location}`);
  } catch (error) {
    log.error(`ERR: ${message} at ?????`);
  }
};

const LogInfo = (message) => {
  log.info(`${message}`);
};

const Log = (message) => {
  log.debug(`${message}`);
};

export { LogException, LogEnable, LogError, LogInfo, Log };
