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
    this.id = elementId;
    this.name = name;

    this.domElement = this.findDomObject(this.elementId);
    this.olabObject = clientApi.findOLabObject(this.elementId, type);
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

  isHidden() {
    return !this.olabObject.visible;
  }

  hide() {
    this.olabObject.visible = false;
    let obj = { ...this.olabObject };
    this.clientApi.updateObject(obj);
  }

  show() {
    this.olabObject.visible = true;
    let obj = { ...this.olabObject };
    this.clientApi.updateObject(obj);
  }
}
