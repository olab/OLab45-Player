// "use strict";
import { OLabApiObject } from "../OLabApiObject";

export class OLabApiConstant extends OLabApiObject {
  constructor(clientApi, id) {
    super(clientApi, "CONST:" + id, id, "constants");
  }

  get value() {
    return this.scopedObject.value;
  }

  set value(value) {
    this.scopedObject.value = value;
  }
}
