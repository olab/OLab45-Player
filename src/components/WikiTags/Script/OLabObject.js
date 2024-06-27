"use strict";

export class OLabObject {
  self = this;

  #clientApi;

  constructor(clientApi, elementId, objectIdName, scopeIndex) {
    this.#clientApi = clientApi;
    this.id = objectIdName;
    this.elementId = elementId;
    this.domElement = this.findElement(this.elementId);
    this.serverObject = this.findServerObject(this.id, scopeIndex);
  }

  findServerObject(idName, scopeIndex) {
    for (const element of this.#clientApi.scopedObjects.map[scopeIndex]) {
      if (element.id === idName || element.name === idName) {
        console.log(`found ${scopeIndex} '${idName}'`);
        return element;
      }
    }

    throw new Error(`unknown ${scopeIndex} with id '${idName}'`);
  }

  findElement(id) {
    let domElement = document.getElementById(id);
    if (domElement == null) {
      throw new Error(`unknown element with id '${id}'`);
    }
    return domElement;
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
