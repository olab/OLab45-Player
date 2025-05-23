// "use strict";
import { OLabApiObject } from "../OLabApiObject";

export class OLabApiLink extends OLabApiObject {
  constructor(clientApi, id) {
    super(clientApi, "LINK:" + id, id, "links");
  }

  get text() {
    return this.scopedObject.value;
  }

  set text(value) {
    this.scopedObject.value = value;
  }
}
