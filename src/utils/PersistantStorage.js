class PersistantStorage {

  static clear(prefix = null) {
    localStorage.clear();
  }

  static all(prefix = null) {
    return localStorage;
  }
  
  static have(key) {
    return localStorage.getItem(key) != null;
  }

  static get(prefix, key, defaultValue = null) {

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

  static save(prefix, key, value) {

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

export { PersistantStorage }