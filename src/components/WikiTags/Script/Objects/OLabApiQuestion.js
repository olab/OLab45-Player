// "use strict";
import { OLabApiObject } from "../OLabApiObject";

export class OLabApiQuestion extends OLabApiObject {
  constructor(clientApi, questionType, id) {
    super(clientApi, `${questionType}:${id}`, id, "questions");
    this.stem = null;
  }

  onChange(callback) {
    this.onEvent("change", callback);
  }
}
