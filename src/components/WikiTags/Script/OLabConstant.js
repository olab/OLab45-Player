"use strict";
import { OLabObject } from "./OLabObject";

export class OLabConstant extends OLabObject {
  constructor(clientApi, params) {
    super(clientApi, params);
    this.target = this.clientApi.player.getConstant(this.params.id);
  }

  getValue() {
    if (this.target == null) {
      throw "Object '" + params.id + "' not found.";
    }

    return this.target["value"];
  }
}
