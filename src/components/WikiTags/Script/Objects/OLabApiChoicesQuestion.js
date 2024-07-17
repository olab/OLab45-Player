// "use strict";
import { OLabApiQuestion } from "./OLabApiQuestion";

export class OLabApiChoicesQuestion extends OLabApiQuestion {
  choices;

  constructor(clientApi, questionType, id) {
    super(clientApi, questionType, id);

    let qrDomElements = document.querySelectorAll(
      `[id*="${this.elementId}::QR"]`
    );
    this.choices = [];

    for (const qrElement of qrDomElements) {
      this.choices.push({
        id: qrElement.id,
      });
    }
  }
}
