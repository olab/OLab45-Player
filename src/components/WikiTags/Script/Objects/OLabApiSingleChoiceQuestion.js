// "use strict";
import { OLabApiChoicesQuestion } from "./OLabApiChoicesQuestion";

export class OLabApiSingleChoiceQuestion extends OLabApiChoicesQuestion {
  constructor(clientApi, id) {
    super(clientApi, "QUSP", id);
  }

  get value() {
    var checkedElement = document.querySelectorAll(
      `[id*="${this.elementId}::QR"] input:checked`
    );

    if (checkedElement.length === 1) {
      return {
        id: Number(checkedElement[0]["value"]),
        value: checkedElement[0]["name"],
      };
    }

    return null;
  }
}
