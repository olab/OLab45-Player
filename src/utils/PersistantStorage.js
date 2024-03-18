import { Apps } from "@material-ui/icons";

class PersistantStorage {
  static clear(keyPrefix = null) {
    if (keyPrefix == null) {
      localStorage.clear();
    } else {
      localStorage.removeItem(keyPrefix);
    }
  }

  static getAppSettings(keyPrefix = null) {
    if (keyPrefix == null) {
      throw new Error("missing keyPrefix");
    }

    const appRoot = localStorage.getItem(keyPrefix);

    // save fresh object if doesn't exist yet
    if (appRoot == null) {
      this.saveObject(keyPrefix, {
        debug: {
          disableWikiRendering: false,
          disableCache: false,
        },
      });
      return this.getAppSettings(keyPrefix);
    }

    let appSettings = null;

    try {
      appSettings = JSON.parse(appRoot);
    } catch (error) {
      throw new Error(
        `could not parse ${keyPrefix} settings. ${JSON.stringify(error)}`
      );
    }

    return appSettings;
  }

  static getUsing(appSettings, key, defaultValue = null) {
    if (appSettings.hasOwnProperty(key)) {
      return appSettings[key];
    }

    return defaultValue;
  }

  static get(keyPrefix, key, defaultValue = null) {
    const appSettings = this.getAppSettings(keyPrefix);

    if (appSettings.hasOwnProperty(key)) {
      return appSettings[key];
    }

    return defaultValue;
  }

  static save(keyPrefix, key, value) {
    const appValue = this.getAppSettings(keyPrefix);

    appValue[key] = value;
    this.saveObject(keyPrefix, appValue);

    return value;
  }

  static saveObject(key, value) {
    if (typeof value !== "object") {
      throw new Error(`${key} value not an object`);
    }

    localStorage.setItem(key, JSON.stringify(value));
  }
}

export { PersistantStorage };
