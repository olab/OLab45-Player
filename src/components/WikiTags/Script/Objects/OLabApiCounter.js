// "use strict";
import { OLabApiScopedObject } from "./OLabApiScopedObject";
import { putCounterValue } from "../../../../services/api";
import log from "loglevel";

export class OLabApiCounter extends OLabApiScopedObject {
  constructor(clientApi, id) {
    super(clientApi, "CR:" + id, id, "counters");
  }

  getValue() {
    return this.olabObject.value;
  }

  setValue(value, callback = null) {
    // let element = this.getElement();
    // element.textContent = value;
    this.olabObject.value = value;

    try {
      log.debug("Setting counter " + this.olabObject.id + " = " + value);

      putCounterValue(this.clientApi.props, this.olabObject).then((result) => {
        this.clientApi.updateDynamicObject(result.data);
        if (callback != null) callback(this.olabObject.value);
      });
    } catch (e) {
      alert(e.message);
    }
  }

  hide() {
    this.olabObject.visible = false;
  }

  show() {
    this.olabObject.visible = false;
  }
}
