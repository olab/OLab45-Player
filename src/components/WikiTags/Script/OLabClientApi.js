import { OLabApiLink } from "./Objects/OLabApiLink";
import { OLabApiConstant } from "./Objects/OLabApiConstant";
import { OLabApiDomObject } from "./Objects/OLabApiDomObject";
import { OLabApiDragAndDropQuestion } from "./Objects/Question/OLabApiDragAndDropQuestion";
import { OLabApiDropdownQuestion } from "./Objects/Question/OLabApiDropdownQuestion";
import { OLabApiMultipleChoiceQuestion } from "./Objects/Question/OLabApiMultipleChoiceQuestion";
import { OLabApiSingleChoiceQuestion } from "./Objects/Question/OLabApiSingleChoiceQuestion";
import { OLabApiSliderQuestion } from "./Objects/Question/OLabApiSliderQuestion";
import { OLabApiTextQuestion } from "./Objects/Question/OLabApiTextQuestion";

import log from "loglevel";
import { OLabApiCounter } from "./Objects/OLabApiCounter";
import { ScopedObject } from "../../../utils/ScopedObject";

// main view class
export class OLabClientApi {
  timers = {};
  timerInfo = {};
  events = {};
  component;
  dynamicObject;
  scopedObjects;
  state;

  constructor(component) {
    var vm = this;

    this.component = component;
    this.dynamicObject = vm.component.state.dynamicObject;
    this.scopedObject = vm.component.state.scopedObject;
    this.timers = vm.timers;
    this.events = vm.events;
    this.state = vm.component.state;
    this.mounted = false;
    this.props = component.props.props;

    log.setLevel(log.levels.DEBUG);
    this.hello();
  }

  hello() {
    let message = "hello from OLabClientApi.";
    log.debug(message);
    return message;
  }

  shutdown() {
    log.debug("shutdown OLabClientApi.");

    var keys = Object.keys(this.timers);
    for (let key of keys) {
      this.destroyTimer(key);
    }

    keys = Object.keys(this.events);
    for (let key of keys) {
      this.destroyEventHandler(key);
    }
  }

  #searchCollection(array, elementId) {
    if (!Array.isArray(array)) {
      return null;
    }
    for (const obj of array) {
      if (obj.htmlIdBase === elementId) {
        log.debug(`found '${elementId}'`);
        return { ...obj };
      }
    }
    return null;
  }

  // find and return a copy of an OLab scoped object
  // of a certain type by id or name
  findOLabObject(id, type) {
    if (type === "counters") {
      return this.dynamicObject.getCounter(id);
    }

    if (type === "links") {
      if (this.props.node.links) {
        var obj = this.#searchCollection(this.props.node.links, id);
        if (obj != null) {
          return { ...obj };
        }
        return null;
      }
    }

    obj = this.scopedObject.getObject(type, id);
    if (obj != null) {
      return { ...obj };
    }

    throw new Error(`unknown ${type} scopedObject with id '${id}'`);
  }

  findWikiInList(list, wiki) {
    let match = null;

    for (let element of list) {
      if (element.name === wiki || element.id === Number(wiki)) {
        match = element;
        break;
      }
    }

    if (match == null) {
      throw new Error(`object '${wiki}' not found`);
    }
    return match;
  }

  // Function to load external HTML into current document
  loadExternalDiv(url, targetElementId) {
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = data;
        const externalDiv = tempDiv.querySelector("div");
        if (externalDiv) {
          document.getElementById(targetElementId).innerHTML =
            externalDiv.outerHTML;
        } else {
          console.error("No div found in external file.");
        }
      })
      .catch((error) => console.error("Error loading external HTML:", error));
  }

  updateScopedObject(newObject) {
    this.component.updateScopedObject(newObject);
  }

  updateObject(newObject) {
    this.component.updateObject(newObject);
  }

  updateDynamicObject(newCounter) {
    this.dynamicObject.setCounter(newCounter);
    this.component.updateDynamicObjects(this.dynamicObject.data);
  }

  updateDynamicObjects(newCounters) {
    this.component.updateDynamicObjects(newCounters);
  }

  createOneShotTimer(frequencyMs, callback) {
    const key = `oneshot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.timerInfo[key] = {
      startedAt: Date.now(),
      lastFiredAt: null,
      periodMs: frequencyMs,
    };
    this.timers[key] = setTimeout(() => {
      // destroy first so the timer is removed even if the callback throws
      this.destroyTimer(key);
      callback();
    }, frequencyMs);
    log.debug(`created one-shot timer '${key}' in ${frequencyMs} ms`);
    return key;
  }

  createRecurringTimer(frequencyMs, callback) {
    callback();
    const key = `recurring-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.destroyTimer(key);
    const now = Date.now();
    this.timerInfo[key] = {
      startedAt: now,
      lastFiredAt: now,
      periodMs: frequencyMs,
    };
    this.timers[key] = setInterval(() => {
      this.timerInfo[key].lastFiredAt = Date.now();
      callback(this, document);
    }, frequencyMs);
    log.debug(`created recurring timer '${key}' frequency ${frequencyMs} ms`);
    return key;
  }

  destroyTimer(key) {
    // test if timer exists
    if (this.timers.hasOwnProperty(key)) {
      clearInterval(this.timers[key]);
      this.timers[key] = null;
      delete this.timers[key];
      delete this.timerInfo[key];

      log.debug(`destroyed timer '${key}'`);
    }
  }

  // returns null if the timer doesn't exist (or a one-shot already fired)
  getTimerStatus(key) {
    const info = this.timerInfo[key];
    if (!info) {
      return null;
    }
    const now = Date.now();
    const sinceLastCallMs = now - (info.lastFiredAt ?? info.startedAt);
    return {
      elapsedMs: now - info.startedAt,
      sinceLastCallMs,
      remainingMs: Math.max(0, info.periodMs - sinceLastCallMs),
    };
  }

  createEventHandler(id, eventName, callback) {
    var element = document.getElementById(id);
    if (element != null) {
      const key = `${id}:${eventName}`;
      if (this.events.hasOwnProperty(key)) {
        return;
      }
      element.removeEventListener(eventName, callback);
      element.addEventListener(eventName, callback);
      this.events[key] = {
        eventName: eventName,
        element: element,
        callback: callback,
      };
      log.debug(`added event '${key}' handler`);
    } else {
      throw new Error(`element '${id}' does not exist`);
    }
  }

  destroyEventHandler(key) {
    // test if handler exists
    if (this.events.hasOwnProperty(key)) {
      let item = this.events[key];
      item.element.removeEventListener(item.eventName, item.callback);
      delete this.events[key];

      log.debug(`destroyed handler '${key}'`);
    }
  }

  // add a click callback on a Dom element
  onClick(id, callback) {
    var element = document.getElementById(id);
    if (element != null) {
      element.onclick = callback;
      log.debug(`added event '${id}' onclick handler`);
    }
    // this.onEvent(id, "click", callback);
  }

  // add an event callback on a Dom element
  onEvent(id, eventName, callback) {
    this.createEventHandler(id, eventName, callback);
  }

  // dump all elements with an 'id' attribute
  // for reference purposes
  getOLabObjectList() {
    log.debug(`Id elements list:`);

    var elements = document.querySelectorAll("*[id]");
    elements.forEach((element) => {
      log.debug(`  ${element.id}`);
    });
  }

  getDomObject(id) {
    let apiDomObject = new OLabApiDomObject(this, id);
    return apiDomObject;
  }

  getScript(name) {
    try {
      let item = this.scopedObject.getObject(ScopedObject.SCRIPTS, name);
      if (item == null) {
        log.error(`Could not find script '${name}'`);
      }
    } catch (error) {
      log.error(`error looking up script ${name}: ${error}`);
    }

    return item;
  }

  getLink(id) {
    var obj = new OLabApiLink(this, id);
    return obj;
  }

  getCounter(id) {
    var obj = new OLabApiCounter(this, id);
    return obj;
  }

  getConstant(id) {
    var obj = new OLabApiConstant(this, id);
    return obj;
  }

  getSliderQuestion(id) {
    var obj = new OLabApiSliderQuestion(this, id);
    return obj;
  }

  getDropDownQuestion(id) {
    var obj = new OLabApiDropdownQuestion(this, id);
    return obj;
  }

  getDragAndDropQuestion(id) {
    var obj = new OLabApiDragAndDropQuestion(this, id);
    return obj;
  }

  getTextQuestion(id) {
    var obj = new OLabApiTextQuestion(this, id);
    return obj;
  }

  getMultipleChoiceQuestion(id) {
    var obj = new OLabApiMultipleChoiceQuestion(this, id);
    return obj;
  }

  getSingleChoiceQuestion(id) {
    var obj = new OLabApiSingleChoiceQuestion(this, id);
    return obj;
  }

  jumpToNode(nodeId) {
    log.debug(`jumpToNode(${nodeId})`);
    this.props.onNavigateToNode(1470, nodeId, "");
  }
}
