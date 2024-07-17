// "use strict";
import { OLabApiChoicesQuestion } from "./OLabApiChoicesQuestion";

export class OLabApiMultipleChoiceQuestion extends OLabApiChoicesQuestion {
  constructor(clientApi, id) {
    super(clientApi, "QUMP", id);
  }

  get value() {
    var checkedElements = document.querySelectorAll(
      `[id*="${this.elementId}::QR"] input:checked`
    );

    let items = [];
    for (const checkedElement of checkedElements) {
      items.push({
        id: Number(checkedElement["id"]),
        value: checkedElement["name"],
      });
    }

    return items;
  }
}
