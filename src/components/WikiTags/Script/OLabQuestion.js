"use strict";
import { OLabObject } from "./OLabObject";

export class OLabQuestion extends OLabObject {
  constructor(clientApi, params) {
    super(clientApi, params);
    this.basePath = "div#" + "QU_" + this.params.id;

    this.target = jQuery(this.basePath);
    if (this.target.length === 1) {
      this.target = this.target[0];
    } else {
      throw "Object '" + this.params.id + "' multiple instances or not found.";
    }
  }

  hide() {
    this.target.hide();
  }

  show() {
    this.target.show();
  }
}

export class OLabQuestionSingleLine extends OLabQuestion {
  constructor(clientApi, params) {
    super(clientApi, params);
  }

  get value() {
    return this.target.value();
  }
}

export class OLabChoicesQuestion extends OLabQuestion {
  constructor(clientApi, params) {
    super(clientApi, params);

    this.choiceObjs = jQuery(this.target).find(
      "input[type='" + params.inputType + "']"
    );
  }

  get rawChoices() {
    return this.choiceObjs;
  }

  disable() {
    try {
      jQuery.each(this.choiceObjs, function (index, value) {
        jQuery(value).prop("disabled", true);
      });
    } catch (e) {
      alert(e.message);
    }
  }

  enable() {
    try {
      jQuery.each(this.choices, function (index, value) {
        jQuery(value).prop("disabled", true);
      });
    } catch (e) {
      alert(e.message);
    }
  }
}

export class OLabQuestionMultipleChoice extends OLabChoicesQuestion {
  constructor(clientApi, params) {
    params["inputType"] = "checkbox";
    super(clientApi, params);
  }

  get choices() {
    var choiceObjs = this.rawChoices();
    for (var i = 0; i < choiceObjs.length; i++) {
      var item = choiceObjs[i];
      choices.push({
        id: parseInt(item.attributes["response"].value),
        name: item.name,
        text: item.attributes["data-val"].value,
      });
    }

    return choices;
  }

  get selected() {
    var choiceObjs = this.rawChoices();
    for (var i = 0; i < choiceObjs.length; i++) {
      var item = items[i];
      choices.push({
        id: parseInt(item.attributes["response"].value),
        name: item.name,
        text: item.attributes["data-val"].value,
      });
    }

    return choices;
  }

  onChanged(func) {
    this.choiceObjs.click(func);
  }
}

export class OLabQuestionRadio extends OLabQuestion {
  constructor(clientApi, params) {
    super(clientApi, params);
  }

  get choices() {
    var choices = [];

    var choiceObjs = jQuery(this.target).find("input[type='radio']");

    for (var i = 0; i < choiceObjs.length; i++) {
      var item = choiceObjs[i];
      choices.push({
        id: parseInt(item.attributes["response"].value),
        name: item.name,
        text: item.attributes["data-val"].value,
      });
    }

    return choices;
  }

  get selected() {
    var choices = [];
    var items = jQuery(this.target).find("input[type='radio']:checked");

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      choices.push({
        id: parseInt(item.attributes["response"].value),
        name: item.name,
        text: item.attributes["data-val"].value,
      });
    }

    return choices;
  }

  disable() {
    try {
      var choiceObjs = jQuery(this.target).find("input[type='radio']");
      jQuery.each(choiceObjs, function (index, value) {
        jQuery(value).prop("disabled", true);
      });
    } catch (e) {
      alert(e.message);
    }
  }

  enable() {
    try {
      var choiceObjs = jQuery(this.target).find("input[type='radio']");
      jQuery.each(choiceObjs, function (index, value) {
        jQuery(value).prop("disabled", true);
      });
    } catch (e) {
      alert(e.message);
    }
  }

  onChanged(func) {
    jQuery(this.target).find("input[type='radio']").click(func);
  }
}
