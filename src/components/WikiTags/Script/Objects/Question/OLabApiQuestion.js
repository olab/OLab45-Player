// "use strict";
import { OLabApiScopedObject } from "../OLabApiScopedObject";

export class OLabApiQuestion extends OLabApiScopedObject {
  constructor(clientApi, name) {
    super(clientApi, `QU:${name}`, name, "questions");
  }

  #getStemElement() {
    const elementId = `${this.olabObject.htmlIdBase}::stem`;
    const element = document.getElementById(elementId);
    const childDiv = element.querySelector("div");
    return childDiv;
  }

  onChange(callback) {
    this.onEvent("change", callback);
  }

  update() {
    // get and make a copy of the scoped object
    // let obj = { ...this.findOLabObject(this.scopedObject.id, "questions") };
    let obj = { ...this.olabObject };
    this.clientApi.updateObject(obj);
  }

  get stem() {
    let stemElement = this.#getStemElement();
    return stemElement.textContent;
  }

  set stem(value) {
    let stemElement = this.#getStemElement();
    stemElement.textContent = value;
    this.olabObject.stem = value;
    this.update(this.olabObject);
  }

  getResponses() {
    let responses = [];

    const elementId = `${this.olabObject.htmlIdBase}::responses`;
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
    for (const response of this.olabObject.responses) {
      if (response.name === name) {
        response.response = value;
        break;
      }
    }
  }
}
