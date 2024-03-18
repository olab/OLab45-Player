import { Apps } from "@material-ui/icons";
import log from "loglevel";

class PersistantStorage {
  static clear(keyPrefix = null) {
    if (keyPrefix == null) {
      localStorage.clear();
    } else {
      let prefixKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);

        // test for end of keys
        if (key == null) {
          break;
        }

        const index = key.indexOf(keyPrefix);

        // test for non-found key
        if (index == -1) {
          continue;
        }

        prefixKeys.push(key);
      }

      for (const key of prefixKeys) {
        localStorage.removeItem(key);
        log.debug(`deleted ${key}`);
      }
    }
  }

  static get(keyPrefix, key, defaultValue = null) {
    var tempKey = `${keyPrefix}${key}`;
    var value = localStorage.getItem(tempKey);

    if (value == null && defaultValue != null) {
      this.save(keyPrefix, key, defaultValue);
      log.debug(`set ${key} = default ${JSON.stringify(defaultValue)}`);

      return defaultValue;
    }

    try {
      const appSettings = JSON.parse(value);
      log.debug(`set ${key} = ${JSON.stringify(appSettings)}`);

      return appSettings;
    } catch (error) {
      throw new Error(
        `could not parse ${keyPrefix} settings. ${JSON.stringify(error)}`
      );
    }
  }

  static save(keyPrefix, key, value) {
    this.saveObject(`${keyPrefix}${key}`, value);
    return value;
  }

  static saveObject(key, obj) {
    const value = JSON.stringify(obj);
    log.debug(`saving ${key} = ${value}`);
    localStorage.setItem(key, value);
  }
}

export { PersistantStorage };
