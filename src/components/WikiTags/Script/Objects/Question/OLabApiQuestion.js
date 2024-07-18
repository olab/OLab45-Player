// "use strict";
import { OLabApiObject } from "../../OLabApiObject";

export class OLabApiQuestion extends OLabApiObject {
  constructor(clientApi, name) {
    super(clientApi, `QU:${name}`, name, "questions");
    this.stem = null;
  }

  onChange(callback) {
    this.onEvent("change", callback);
  }

  get label() {
    return this.scopedObject.stem;
  }

  set label(value) {
    let question = this.findOLabObject(this.scopedObject.name, "questions");
    if (question == null) {
      throw new Error(`cannot set label for ${this.elementId}`);
    }

    question.stem = value;

    this.clientApi.updateState();
  }
}
