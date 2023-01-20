class PersistantStateStorage {

  static clear() {
    localStorage.clear();
  }

  static have(key) {
    return localStorage.getItem(key) != null;
  }

  static get(key, defaultValue = null) {

    let valueObject = null;
    const value = localStorage.getItem(key);

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

  static save(key, value) {

    if (typeof value === 'object' && value !== null) {
      this.saveObject(key, value);
    }
    else {
      localStorage.setItem(key, value);
    }

    return value;

  };

  static saveObject(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  };

}

export { PersistantStateStorage }