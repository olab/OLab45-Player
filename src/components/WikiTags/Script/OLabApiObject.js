// "use strict";
import log from "loglevel";
export class OLabApiObject {
  self = this;

  clientApi;

  constructor(clientApi, elementId, name = null, type = null) {
    log.debug(
      `building ${this.constructor["name"]} '${elementId}' '${name}' '${type}'`
    );

    this.clientApi = clientApi;
    this.elementId = elementId;

    if (name != null && type != null) {
      this.scopedObject = this.findOLabObject(name, type);
      this.id = name;
    } else {
      this.id = elementId;
    }

    this.domElement = this.findDomObject(this.elementId);
  }

  // find and return a copy of an OLab scoped object
  // of a certain type by id or name
  findOLabObject(idName, type) {
    const scopedObjects = this.clientApi.scopedObjects;

    for (const obj of scopedObjects.server[type]) {
      if (obj.id === idName || obj.name === idName) {
        log.debug(`found server ${type} '${idName}'`);
        return { ...obj };
      }
    }

    for (const obj of scopedObjects.map[type]) {
      if (obj.id === idName || obj.name === idName) {
        log.debug(`found map ${type} '${idName}'`);
        return { ...obj };
      }
    }

    for (const obj of scopedObjects.node[type]) {
      if (obj.id === idName || obj.name === idName) {
        log.debug(`found node ${type} '${idName}'`);
        return { ...obj };
      }
    }

    throw new Error(`unknown ${type} scopedObject with id '${idName}'`);
  }

  // find an HTML DOM object by id attribute
  findDomObject(id) {
    let domElement = document.getElementById(id);
    if (domElement == null) {
      throw new Error(`unknown dom element with id '${id}'`);
    }
    return domElement;
  }

  onClick(callback) {
    this.onEvent("click", callback);
  }

  onEvent(event, callback) {
    this.domElement.addEventListener(event, callback);
    log.debug(`added event '${event}' handler for '${this.domElement.id}'`);
  }

  enable() {
    this.domElement.disabled = false;
  }

  disable() {
    this.domElement.disabled = true;
  }

  hide() {
    this.domElement.style.display = "none";
  }

  show() {
    this.domElement.style.display = "block";
  }
}
