// "use strict";
import { OLabApiScopedObject } from "./OLabApiScopedObject";

export class OLabApiConstant extends OLabApiScopedObject {
  constructor(clientApi, id) {
    super(clientApi, "CONST:" + id, id, "constants");
  }

  get value() {
    return this.olabObject.value;
  }

  set value(value) {
    this.olabObject.value = value;
  }
}
