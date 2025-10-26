// "use strict";
import { OLabApiChoicesQuestion } from "./OLabApiChoicesQuestion";

export class OLabApiSingleChoiceQuestion extends OLabApiChoicesQuestion {
  constructor(clientApi, name) {
    super(clientApi, name);
  }

  get value() {
    const inputElements = this.domElement.getElementsByTagName("input");
    let items = [];

    for (const item of inputElements) {
      if (!item.checked) {
        continue;
      }

      // thrpw out stuff to extract just the QR name
      let name = item.id.replace("QR:", "");
      name = name.replace("::input", "");

      for (const response of this.olabObject.responses) {
        if (response.name === name) {
          items.push({
            id: response.id,
            name: response.name,
            text: response.response,
          });
        }
      }
    }

    return items;
  }
}
