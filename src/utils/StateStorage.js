class PersistantStateStorage {

  static clear() {
    localStorage.clear();
  }

  static have(key) {
    return localStorage.getItem(key) != null;
  }

  static get(userName, key, defaultValue = null) {

    let valueObject = null;
    let fullKey = key;
    if ( userName ) {
      fullKey = `${userName}:${key}`;
    }

    const value = localStorage.getItem(fullKey);

    try {
      valueObject = JSON.parse(value);
    } catch (error) {
      valueObject = value;
    }

    if ( valueObject == null ) {
      valueObject = defaultValue;
    }

    return valueObject;
  };

  static save(userName, key, value) {

    let fullKey = key;
    if ( userName ) {
      fullKey = `${userName}:${key}`;
    }

    if (typeof value === 'object' && value !== null) {
      this.saveObject(fullKey, value);
    }
    else {
      localStorage.setItem(fullKey, value);
    }

    return value;

  };

  static saveObject(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  };

}

export { PersistantStateStorage }