// "use strict";
import { OLabApiObject } from "../OLabApiObject";

export class OLabApiScopedObject extends OLabApiObject {
  constructor(clientApi, elementId, name = null, type = null) {
    super(clientApi, elementId, name, type);

    this.id = name;
  }

  getElement() {
    const elementId = this.olabObject.htmlIdBase;
    const element = document.getElementById(elementId);
    return element;
  }

  hide() {
    this.olabObject.visible = false;
    let obj = { ...this.olabObject };
    this.clientApi.updateScopedObject(obj);
  }

  show() {
    this.olabObject.visible = true;
    let obj = { ...this.olabObject };
    this.clientApi.updateScopedObject(obj);
  }
}
