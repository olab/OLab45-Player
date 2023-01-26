import log from 'loglevel';

const LogEnable = () => {
  log.enableAll();
}

const LogError = (message) => {
  log.error(`ERR: ${message}`);
}

const LogInfo = (message) => {
  log.info(`${message}`);
}

const Log = (message) => {
  log.debug(`${message}`);
}

export {
  LogEnable,
  LogError,
  LogInfo,
  Log
};