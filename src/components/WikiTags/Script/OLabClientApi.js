﻿import {
  OLabApiDragAndDropQuestion,
  OLabApiDropdownQuestion,
  OLabApiMultipleChoiceQuestion,
  OLabApiSingleChoiceQuestion,
  OLabApiSliderQuestion,
  OLabApiTextQuestion,
} from "./Objects/OLabApiQuestion";
import { OLabApiConstant } from "./Objects/OLabApiConstant";

import { OLabApiDomObject } from "./Objects/OLabApiDomObject";
import { Log, LogInfo, LogError } from "../../../utils/Logger";

// main view class
export class OLabClientApi {
  timers = {};

  constructor(params) {
    var vm = this;

    vm.scopedObjects = params.scopedObjects;
    vm.dynamicObjects = params.dynamicObjects;

    // these are the methods/properties we expose to the outside
    vm.service = {
      createTimer: vm.createTimer,
      destroyTimer: vm.destroyTimer,
      dynamicObjects: vm.dynamicObjects,
      getConstant: vm.getConstant,
      getDomObject: vm.getDomObject,
      getDragAndDropQuestion: vm.getDragAndDropQuestion,
      getDropDownQuestion: vm.getDropDownQuestion,
      getMultipleChoiceQuestion: vm.getMultipleChoiceQuestion,
      getOLabObjectList: vm.getOLabObjectList,
      getSingleChoiceQuestion: vm.getSingleChoiceQuestion,
      getSliderQuestion: vm.getSliderQuestion,
      getTextQuestion: vm.getTextQuestion,
      hello: vm.hello,
      onClick: vm.onClick,
      onEvent: vm.onEvent,
      scopedObjects: vm.scopedObjects,
      shutdown: vm.shutdown,
      timers: vm.timers,
    };

    vm.hello();

    return vm.service;
  }

  hello() {
    Log("hello from OLabClientApi.");
  }

  shutdown() {
    Log("shutdown OLabClientApi.");

    var timerNames = Object.keys(this.timers);
    for (let timerName of timerNames) {
      this.destroyTimer(timerName);
    }
  }

  createTimer(key, frequencyMs, callback) {
    callback();
    this.timers[key] = setInterval(callback, frequencyMs, this, document);
    Log(`created timer '${key}' frequency ${frequencyMs} ms`);
  }

  destroyTimer(key) {
    // test if timer exists
    if (this.timers.hasOwnProperty(key)) {
      clearInterval(this.timers[key]);
      this.timers[key] = null;
      delete this.timers[key];

      Log(`destroyed timer '${key}'`);
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
      Log(`added event '${event}' handler for '${id}'`);
    } else throw new Error(`element '${id}' does not exist`);
  }

  // dump all elements with an 'id' attribute
  // for reference purposes
  getOLabObjectList() {
    Log(`Id elements list:`);

    var elements = document.querySelectorAll("*[id]");
    elements.forEach((element) => {
      Log(`  ${element.id}`);
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
