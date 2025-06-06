// "use strict";
import { OLabApiScopedObject } from "./OLabApiScopedObject";
import { putCounterValue } from "../../../../services/api";
import log from "loglevel";

export class OLabApiCounter extends OLabApiScopedObject {
  constructor(clientApi, id) {
    super(clientApi, "CR:" + id, id, "counters");
    // this.target = this.clientApi.player.getCounter(this.params.id);
    // this.setProgressObject("progressSpinner");
  }

  updateDynamicObject(newDynamicObject) {
    // get and make a copy of the scoped object
    // let obj = { ...this.findOLabObject(this.scopedObject.id, "questions") };
    let obj = { ...newDynamicObject };
    this.clientApi.updateDynamicObject(obj);
  }

  get value() {
    // if (this.target == null) {
    //   throw "Object '" + params.id + "' not found.";
    // }
    return this.olabObject.value;
  }

  set value(value) {
    let element = this.getElement();
    element.textContent = value;
    this.olabObject.value = value;

    try {
      log.debug("Setting counter " + this.olabObject.id + " = " + value);

      putCounterValue(this.clientApi.props, this.olabObject).then((result) =>
        this.updateDynamicObject(result.data)
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

      log.debug("Counter " + this.target.id + " update started");
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

      log.debug(
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

      log.debug("Counter " + this.target.id + " update error");
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

  hide(callback = null) {
    let element = this.getElement();
    element.style.display = "none";
    this.olabObject.visible = false;

    try {
      log.debug(
        "Setting counter " +
          this.olabObject.id +
          " visibility " +
          element.style.display
      );

      putCounterValue(this.clientApi.props, this.olabObject).then((result) => {
        this.updateDynamicObject(result.data);

        if (callback != null) {
          callback();
        }
      });
    } catch (e) {
      alert(e.message);
    }
  }

  show() {
    let element = this.getElement();
    element.style.display = "inline";
    this.olabObject.visible = false;

    try {
      log.debug(
        "Setting counter " +
          this.olabObject.id +
          " visibility " +
          element.style.display
      );

      putCounterValue(this.clientApi.props, this.olabObject).then((result) =>
        this.updateDynamicObject(result.data)
      );
    } catch (e) {
      alert(e.message);
    }
  }
}
