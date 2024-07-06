// "use strict";
import { OLabApiObject } from "./OLabApiObject";

export class OLabApiQuestion extends OLabApiObject {
  constructor(clientApi, questionType, id) {
    super(clientApi, `${questionType}:${id}`, id, "questions");
    this.stem = null;
  }

  onChange(callback) {
    this.onEvent("change", callback);
  }
}

export class OLabApiDragAndDropQuestion extends OLabApiQuestion {
  constructor(clientApi, id) {
    super(clientApi, id);
  }
}

export class OLabApiDropdownQuestion extends OLabApiQuestion {
  constructor(clientApi, id) {
    super(clientApi, id);
  }
}

export class OLabApiSliderQuestion extends OLabApiQuestion {
  constructor(clientApi, id) {
    super(clientApi, id);
  }
}
export class OLabApiTextQuestion extends OLabApiQuestion {
  constructor(clientApi, id) {
    super(clientApi, id);
  }
}

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
