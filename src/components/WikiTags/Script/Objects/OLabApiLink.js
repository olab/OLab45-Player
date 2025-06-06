// "use strict";
import { OLabApiObject } from "../OLabApiObject";

export class OLabApiLink extends OLabApiObject {
  constructor(clientApi, id) {
    super(clientApi, "LINK:" + id, id, "links");
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
