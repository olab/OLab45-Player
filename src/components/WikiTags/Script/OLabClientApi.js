import { OLabApiConstant } from "./Objects/OLabApiConstant";
import { OLabApiDomObject } from "./Objects/OLabApiDomObject";
import { OLabApiDragAndDropQuestion } from "./Objects/Question/OLabApiDragAndDropQuestion";
import { OLabApiDropdownQuestion } from "./Objects/Question/OLabApiDropdownQuestion";
import { OLabApiMultipleChoiceQuestion } from "./Objects/Question/OLabApiMultipleChoiceQuestion";
import { OLabApiSingleChoiceQuestion } from "./Objects/Question/OLabApiSingleChoiceQuestion";
import { OLabApiSliderQuestion } from "./Objects/Question/OLabApiSliderQuestion";
import { OLabApiTextQuestion } from "./Objects/Question/OLabApiTextQuestion";

import log from "loglevel";

// main view class
export class OLabClientApi {
  timers = {};
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
    this.state = vm.component.state;
    this.mounted = false;

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

    var timerNames = Object.keys(this.timers);
    for (let timerName of timerNames) {
      this.destroyTimer(timerName);
    }
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

  // Function to load external HTML
  loadExternalDiv(file, targetElementId) {
    fetch(file)
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

  updateObject(newObject) {
    this.component.updateObject(newObject);
  }

  createTimer(key, frequencyMs, callback) {
    callback();
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
    } else throw new Error(`timer '${key}' does not exist`);
  }

  // add a click callback on a Dom element
  onClick(id, callback) {
    this.onEvent(id, "click", callback);
  }

  // add an event callback on a Dom element
  onEvent(id, event, callback) {
    var element = document.getElementById(id);
    if (element != null) {
      element.addEventListener(event, callback);
      log.debug(`added event '${event}' handler for '${id}'`);
    } else throw new Error(`element '${id}' does not exist`);
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

  getConstant(id) {
    var apiQuestion = new OLabApiConstant(this, id);
    return apiQuestion;
  }

  getSliderQuestion(id) {
    var apiQuestion = new OLabApiSliderQuestion(this, id);
    return apiQuestion;
  }

  getDropDownQuestion(id) {
    var apiQuestion = new OLabApiDropdownQuestion(this, id);
    return apiQuestion;
  }

  getDragAndDropQuestion(id) {
    var apiQuestion = new OLabApiDragAndDropQuestion(this, id);
    return apiQuestion;
  }

  getTextQuestion(id) {
    var apiQuestion = new OLabApiTextQuestion(this, id);
    return apiQuestion;
  }

  getMultipleChoiceQuestion(id) {
    var apiQuestion = new OLabApiMultipleChoiceQuestion(this, id);
    return apiQuestion;
  }

  getSingleChoiceQuestion(id) {
    var apiQuestion = new OLabApiSingleChoiceQuestion(this, id);
    return apiQuestion;
  }
}
