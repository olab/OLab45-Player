// "use strict";
import { OLabApiQuestion } from "./OLabApiQuestion";

export class OLabApiChoicesQuestion extends OLabApiQuestion {
  constructor(clientApi, name) {
    super(clientApi, name);
  }

  get choices() {
    let items = [];
    for (const response of this.scopedObject.responses) {
      items.push({
        id: response.id,
        name: response.name,
        text: response.response,
      });
    }

    return items;
  }
}
