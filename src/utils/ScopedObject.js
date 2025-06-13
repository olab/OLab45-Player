import log from "loglevel";
import { config } from "../config";
const PlayerState = require("./PlayerState").PlayerState;

class ScopedObject {
  static NODE = "node";
  static MAP = "map";
  static SERVER = "server";
  static CONSTANTS = "constants";
  static COUNTERS = "counters";
  static QUESTIONS = "questions";
  static FILES = "files";
  static SCRIPTS = "scripts";
  static CONSTANT = "constant";
  static COUNTER = "counter";
  static QUESTION = "question";
  static FILE = "file";
  static SCRIPT = "script";

  #scopedObject = null;

  constructor(obj = null) {
    if (obj == null) {
      obj = this.load();
    }
    this.#scopedObject = obj;
    this.save();
  }

  get data() {
    return this.#scopedObject;
  }

  load() {
    let obj = {
      map: PlayerState.GetMapStatic(),
      node: PlayerState.GetNodeStatic(),
      server: PlayerState.GetServerStatic(),
    };

    log.debug("loaded scopedObject");
    return obj;
  }

  save() {
    PlayerState.SetMapStatic(this.data.map);
    PlayerState.SetNodeStatic(this.data.node);
    PlayerState.SetServerStatic(this.data.server);
    log.debug("saved scopedObject");
  }

  clone() {
    return { ...this.data };
  }

  update(obj) {
    this.#scopedObject = obj;
  }

  #getType(source, type, copy = false) {
    var obj = source[type] ? source[type] : null;
    if (copy === true) {
      return [...obj];
    }
    return obj;
  }

  #findInList = (list, name) => {
    let match = null;

    for (let element of list) {
      if (
        element.name === name ||
        element.id === Number(name) ||
        element?.htmlIdBase == name
      ) {
        match = element;
        break;
      }
    }

    return match;
  };

  getObjects(type) {
    return [
      ...this.getNode()[type],
      ...this.getMap()[type],
      ...this.getServer()[type],
    ];
  }

  getObject(type, name) {
    const objs = this.getObjects(type);
    return this.#findInList(objs, name);
  }

  getNode(copy = false) {
    return this.#getType(this.data, ScopedObject.NODE, copy);
  }

  getMap(copy = false) {
    return this.#getType(this.data, ScopedObject.MAP, copy);
  }

  getServer(copy = false) {
    return this.#getType(this.data, ScopedObject.SERVER, copy);
  }

  getNodeObjects(type, copy = false) {
    var obj = this.#getType(ScopedObject.NODE);
    return this.#getType(obj, type, copy);
  }

  getMapObjects(type, copy = false) {
    var obj = this.#getType(ScopedObject.MAP);
    return this.#getType(obj, type, copy);
  }

  getServerObjects(copy = false) {
    var obj = this.#getType(ScopedObject.SERVER);
    return this.#getType(obj, type, copy);
  }

  setNodeObjects(obj) {
    this.data[ScopedObject.NODE] = obj;
  }

  setMapObjects(obj) {
    this.data[ScopedObject.MAP] = obj;
  }

  setServerObjects(obj) {
    this.data[ScopedObject.SERVER] = obj;
  }

  updateScopedObject(newObject) {
    // 1. Make a shallow copy of the items
    let { items, objectType, scopeLevel } = this.#getArrayForObject(newObject);

    for (let index = 0; index < items.length; index++) {
      // 2. Make a shallow copy of the item to mutate
      let item = { ...items[index] };

      if (item.id === newObject.id) {
        log.debug(`${item.type} object '${item.name}': changed}`);
        items[index] = newObject;
        break;
      }
    }

    this.save();
  }

  #getArrayForObject(scopedObject, copy = false) {
    let objectType = ScopedObject.translateTypeToObject(scopedObject.type);
    let scopeLevel = ScopedObject.translateLevelToObject(
      scopedObject.scopeLevel
    );

    let items = copy
      ? [...this.data[scopeLevel][objectType]]
      : this.data[scopeLevel][objectType];
    return { items, objectType, scopeLevel };
  }

  static translateTypeToObject = (type) => {
    switch (type) {
      case ScopedObject.QUESTION:
        type = ScopedObject.QUESTIONS;
        break;
      case ScopedObject.CONSTANT:
        type = ScopedObject.CONSTANTS;
        break;
      case ScopedObject.COUNTER:
        type = ScopedObject.COUNTERS;
        break;
      case ScopedObject.FILE:
        type = ScopedObject.FILES;
        break;
      default:
        break;
    }

    return type;
  };

  static translateLevelToObject = (level) => {
    switch (level) {
      case "Maps":
        level = ScopedObject.MAP;
        break;
      case "Nodes":
        level = ScopedObject.NODE;
        break;
      case "Servers":
        level = ScopedObject.SERVER;
        break;
      default:
        break;
    }

    return level;
  };
}

export { ScopedObject };
