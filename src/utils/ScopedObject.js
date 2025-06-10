import log from "loglevel";
import { config } from "../config";
const PlayerState = require("./PlayerState").PlayerState;

class ScopedObject {
  static NODE = "node";
  static MAP = "map";
  static SERVER = "server";

  #scopedObject = null;

  constructor(obj = null) {
    if (obj == null) {
      obj = this.load();
    }
    this.#scopedObject = obj;
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
}

export { ScopedObject };
