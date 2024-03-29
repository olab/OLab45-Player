﻿"use strict";

export class OLabClientObject {
  self = this;

  constructor(clientApi, params) {
    this.clientApi = clientApi;
    this.params = params;
    this.target = null;
    this.player = this.clientApi.player;
  }
}

export class OLabConstant extends OLabClientObject {
  constructor(clientApi, params) {
    super(clientApi, params);
    this.target = this.clientApi.player.getConstant(this.params.id);
  }

  getValue() {
    if (this.target == null) {
      throw "Object '" + params.id + "' not found.";
    }

    return this.target["value"];
  }
}

export class OLabCounter extends OLabClientObject {
  constructor(clientApi, params) {
    super(clientApi, params);
    this.target = this.clientApi.player.getCounter(this.params.id);
    this.setProgressObject("progressSpinner");
  }

  getValue() {
    if (this.target == null) {
      throw "Object '" + params.id + "' not found.";
    }

    return this.target["value"];
  }

  setValue(value, onStarted, onCompleted) {
    try {
      this.onStartedUser = onStarted;
      this.onCompletedUser = onCompleted;

      this.player.instance.log.debug(
        "Setting counter " + this.target.id + " = " + value
      );

      var url =
        this.player.instance.restApiUrl + "/counters/value/" + this.target.id;
      var payload = { data: { value: value } };

      this.onUpdateStarted();

      this.player.utilities.postJson(
        url,
        payload,
        this,
        this.onUpdateCompleted,
        this.onUpdateError
      );
    } catch (e) {
      alert(e.message);
    }
  }

  onUpdateStarted(data) {
    try {
      // if a progress object is set, make it visible
      if (this.progressTarget != null) {
        this.progressTarget.show();
      }

      if (this.onStartedUser != null) {
        this.onStartedUser();
      }

      this.player.instance.log.debug(
        "Counter " + this.target.id + " update started"
      );
    } catch (e) {
      alert(e.message);
    }
  }

  onUpdateCompleted(data, context) {
    try {
      // if a progress object is set, make it visible
      if (context.progressTarget != null) {
        context.progressTarget.hide();
      }

      context.player.instance.log.debug(
        "Counter " +
          context.target.id +
          " set successfully. value = " +
          data.data.value
      );

      var counter = context.player.getCounter(context.target.id);
      counter.value = data.data.value;

      if (context.onCompletedUser != null) {
        context.onCompletedUser();
      }
    } catch (e) {
      alert(e.message);
    }
  }

  onUpdateError(data) {
    try {
      // if a progress object is set, make it visible
      if (this.progressTarget != null) {
        this.progressTarget.hide();
      }

      if (this.onCompletedUser != null) {
        this.onCompletedUser();
      }

      this.player.instance.log.debug(
        "Counter " + this.target.id + " update error"
      );
    } catch (e) {
      alert(e.message);
    }

    alert("error: " + data);
  }

  setProgressObject(divId) {
    this.basePath = "img#" + divId;
    this.progressTarget = jQuery(this.basePath);
    if (this.progressTarget.length >= 1) {
      this.progressTarget = this.progressTarget[0];
    } else {
      this.progressTarget = null;
    }
  }
}

export class OLabQuestion extends OLabClientObject {
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
