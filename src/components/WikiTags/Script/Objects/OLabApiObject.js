"use strict";
import { Log, LogInfo, LogError } from "../../../../utils/Logger";

export class OLabApiObject {
  self = this;

  clientApi;

  constructor(clientApi, elementId, objectIdName = null, scopeIndex = null) {
    Log(
      `creating ${this.constructor["name"]} '${elementId}' '${objectIdName}' '${scopeIndex}'`
    );

    this.clientApi = clientApi;
    this.elementId = elementId;
    this.domElement = this.findDomElement(this.elementId);

    if (objectIdName != null) {
      this.id = objectIdName;
    }

    if (scopeIndex != null) {
      this.scopedObject = this.findScopedObject(this.id, scopeIndex);
    }
  }

  findScopedObject(idName, scopeIndex) {
    for (const scopedObject of this.clientApi.scopedObjects.server[
      scopeIndex
    ]) {
      if (scopedObject.id === idName || scopedObject.name === idName) {
        console.log(`found server ${scopeIndex} '${idName}'`);
        return scopedObject;
      }
    }

    for (const scopedObject of this.clientApi.scopedObjects.map[scopeIndex]) {
      if (scopedObject.id === idName || scopedObject.name === idName) {
        console.log(`found map ${scopeIndex} '${idName}'`);
        return scopedObject;
      }
    }

    for (const scopedObject of this.clientApi.scopedObjects.node[scopeIndex]) {
      if (scopedObject.id === idName || scopedObject.name === idName) {
        console.log(`found node ${scopeIndex} '${idName}'`);
        return scopedObject;
      }
    }

    throw new Error(`unknown ${scopeIndex} scopedObject with id '${idName}'`);
  }

  findDomElement(id) {
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
    Log(`added event '${event}' handler for '${this.domElement.id}'`);
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
