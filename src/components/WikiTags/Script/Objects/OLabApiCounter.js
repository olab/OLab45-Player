// "use strict";
import { OLabApiObject } from "../OLabApiObject";

export class OLabApiCounter extends OLabApiObject {
  constructor(clientApi, id) {
    super(clientApi, "CR:" + id, id, "counters");
    this.target = this.clientApi.player.getCounter(this.params.id);
    this.setProgressObject("progressSpinner");
  }

  get value() {
    if (this.target == null) {
      throw "Object '" + params.id + "' not found.";
    }

    return this.target["value"];
  }

  set value(value) {
    try {
      this.player.instance.log.debug(
        "Setting counter " + this.target.id + " = " + value
      );

      var url =
        this.player.instance.restApiUrl + "/counters/value/" + this.target.id;
      var payload = { data: { value: value } };

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
