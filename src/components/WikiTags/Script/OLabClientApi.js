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

// main view class
export class OLabClientApi {
  timers = {};
  events = {};
  component;
  dynamicObjects;
  scopedObjects;
  state;

  constructor(component) {
    var vm = this;

    this.component = component;
    this.dynamicObjects = vm.component.state.dynamicObjects;
    this.scopedObjects = vm.component.state.scopedObjects;
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
  findOLabObject(elementId, type) {
    if (type === "counters") {
      if (this.dynamicObjects.counters) {
        var obj = this.#searchCollection(
          this.dynamicObjects.counters,
          elementId
        );
        if (obj != null) {
          return { ...obj };
        }
        return null;
      }
    }

    if (type === "links") {
      if (this.props.node.links) {
        var obj = this.#searchCollection(this.props.node.links, elementId);
        if (obj != null) {
          return { ...obj };
        }
        return null;
      }
    }

    if (this.scopedObjects.server[type]) {
      var obj = this.#searchCollection(
        this.scopedObjects.server[type],
        elementId
      );
      if (obj != null) {
        return { ...obj };
      }
    }

    if (this.scopedObjects.map[type]) {
      var obj = this.#searchCollection(this.scopedObjects.map[type], elementId);
      if (obj != null) {
        return { ...obj };
      }
    }

    if (this.scopedObjects.node[type]) {
      var obj = this.#searchCollection(
        this.scopedObjects.node[type],
        elementId
      );
      if (obj != null) {
        return { ...obj };
      }
    }

    throw new Error(`unknown ${type} scopedObject with id '${elementId}'`);
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

  updateDynamicObject(newCounters) {
    this.component.updateDynamicObject(newCounters);
  }

  createTimer(key, callback, frequencyMs) {
    callback();
    this.destroyTimer(key);
    this.timers[key] = setInterval(callback, frequencyMs, this, document);
    log.debug(`created timer '${key}' frequency ${frequencyMs} ms`);
  }

  destroyTimer(key) {
    // test if timer exists
    if (this.timers.hasOwnProperty(key)) {
      clearInterval(this.timers[key]);
      this.timers[key] = null;
      delete this.timers[key];

      log.debug(`destroyed timer '${key}'`);
    }
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
    let item = null;

    try {
      const array = [
        ...this.scopedObjects.node?.scripts,
        ...this.scopedObjects.map?.scripts,
        ...this.scopedObjects.server?.scripts,
      ];

      item = this.findWikiInList(array, name);

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
}
