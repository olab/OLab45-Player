// "use strict";
import { OLabApiObject } from "../../OLabApiObject";
import { render } from "react-dom";
import log from "loglevel";

export class OLabApiQuestion extends OLabApiObject {
  constructor(clientApi, name) {
    super(clientApi, `QU:${name}`, name, "questions");
    this.stem = null;
  }

  onChange(callback) {
    this.onEvent("change", callback);
  }

  update() {
    // get and make a copy of the scoped object
    // let obj = { ...this.findOLabObject(this.scopedObject.id, "questions") };
    let obj = { ...this.scopedObject };
    this.clientApi.updateObject(obj);
  }

  get label() {
    return this.scopedObject.stem;
  }

  set label(value) {
    this.scopedObject.stem = value;
  }

  getResponses() {
    let responses = [];

    const elementId = `${this.scopedObject.htmlIdBase}::choices`;
    const container = document.getElementById(elementId);
    var spans = container.querySelectorAll("[id$=label]");
    for (const response of spans) {
      responses.push(response.innerText);
    }

    return responses;
  }

  getResponse(name) {
    const elementId = `QR:${name}::label`;
    const container = document.getElementById(elementId);

    if (container != null) {
      return container.innerText;
    }

    return null;
  }

  setResponse(name, value) {
    for (const response of this.scopedObject.responses) {
      if (response.name === name) {
        response.response = value;
        break;
      }
    }
  }
}
