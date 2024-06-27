"use strict";
import { OLabObject } from "./OLabObject";

export class OLabQuestion extends OLabObject {
  constructor(clientApi, id) {
    super(clientApi, "QU:" + id, id, "questions");
    this.stem = null;
  }
}

export class OLabDragAndDropQuestion extends OLabQuestion {
  constructor(clientApi, id) {
    super(clientApi, id);
  }
}

export class OLabDropdownQuestion extends OLabQuestion {
  constructor(clientApi, id) {
    super(clientApi, id);
  }
}

export class OLabSliderQuestion extends OLabQuestion {
  constructor(clientApi, id) {
    super(clientApi, id);
  }
}
export class OLabTextQuestion extends OLabQuestion {
  constructor(clientApi, id) {
    super(clientApi, id);
  }
}

export class OLabChoicesQuestion extends OLabQuestion {
  choices;

  constructor(clientApi, id) {
    super(clientApi, id);

    let qrElements = document.querySelectorAll(`[id*="${this.elementId}::QR"]`);
    this.choices = [];

    for (const qrElement of qrElements) {
      this.choices.push({
        id: qrElement.id,
      });
    }
  }
}

export class OLabMultipleChoiceQuestion extends OLabChoicesQuestion {
  constructor(clientApi, id) {
    super(clientApi, id);
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

export class OLabSingleChoiceQuestion extends OLabChoicesQuestion {
  constructor(clientApi, id) {
    super(clientApi, id);
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
