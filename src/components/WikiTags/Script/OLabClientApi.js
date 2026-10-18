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

/**
 * Timing metadata tracked for each timer.
 * @typedef {object} TimerInfo
 * @property {number} startedAt Time the timer was created, in epoch milliseconds.
 * @property {number|null} lastFiredAt Time the callback last fired, in epoch milliseconds; null until a one-shot timer fires.
 * @property {number} periodMs Delay (one-shot) or interval (recurring) in milliseconds.
 * @property {number} elapsedMs Time elapsed since the timer was created, in milliseconds.
 */

// main view class
export class OLabClientApi {
  timers = {};
  /** @type {Object<string, TimerInfo>} Timer info keyed by timer key. */
  timerInfo = {};
  events = {};
  component;
  dynamicObject;
  scopedObjects;
  state;

  /**
   * Creates the script-facing API for a player component.
   * @param {object} component Player component providing state, props, and update methods.
   * @param {Function|null} [onCreateCallback=null] Optional callback invoked after initialization.
   */
  constructor(component, onCreateCallback = null) {
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

    if (onCreateCallback != null) {
      onCreateCallback();
    }
  }

  /**
   * Logs and returns a greeting with the current number of active timers.
   * @returns {string} Greeting message.
   * @throws Rethrows errors encountered while creating or logging the message.
   */
  hello() {
    try {
      let message =
        "hello from OLabClientApi. timers active: " +
        Object.keys(this.timers).length;
      log.debug(message);
      return message;
    } catch (error) {
      log.error(`hello failed: ${error}`);
      throw error;
    }
  }

  /**
   * Destroys the current API instance.
   * @param {Function|null} [onShutdownCallback=null] Callback invoked after cleanup.
   * @throws Rethrows errors encountered during cleanup or in the callback.
   */
  shutdown(onShutdownCallback = null) {
    try {
      this.#destroyAllTimers();
      this.#destroyAllEventHandlers();

      if (onShutdownCallback != null) {
        onShutdownCallback();
      }

      log.debug("shutdown OLabClientApi.");
    } catch (error) {
      log.error(`shutdown failed: ${error}`);
      throw error;
    }
  }

  #destroyAllTimers() {
    try {
      var keys = Object.keys(this.timers);
      for (let key of keys) {
        this.destroyTimer(key);
      }
    } catch (error) {
      log.error(`destroyAllTimers failed: ${error}`);
      throw error;
    }
  }

  /**
   * Gets the current map name.
   * @returns {string|null} Map name, or null if access fails.
   */
  getMapName() {
    try {
      return this.props.map.name;
    } catch (error) {
      log.error(`getMapName failed: ${error}`);
      return null;
    }
  }

  /**
   * Gets the current map ID.
   * @returns {number|string|null} Map ID, or null if access fails.
   */
  getMapId() {
    try {
      return this.props.map.id;
    } catch (error) {
      log.error(`getMapId failed: ${error}`);
      return null;
    }
  }

  /**
   * Gets the current node name.
   * @returns {string|null} Node name, or null if access fails.
   */
  getNodeName() {
    try {
      return this.props.node.title;
    } catch (error) {
      log.error(`getNodeName failed: ${error}`);
      return null;
    }
  }

  /**
   * Gets the current node ID.
   * @returns {number|string|null} Node ID, or null if access fails.
   */
  getNodeId() {
    try {
      return this.props.node.id;
    } catch (error) {
      log.error(`getNodeId failed: ${error}`);
      return null;
    }
  }

  /**
   * Finds a wikitag object by ID or name.
   * @param {string|number} id Object ID or name to find.
   * @param {string} type Object type: `counters`, `links`, or a scoped-object type.
   * @returns {object|null} Matching object; links return null when no matching link exists.
   * @throws {Error} If a scoped object of the requested type cannot be found.
   */
  findOLabObject(id, type) {
    try {
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
    } catch (error) {
      log.error(`findOLabObject failed: ${error}`);
      throw error;
    }
  }

  /**
   * Finds a list item whose name or numeric ID matches the supplied value.
   * @param {Array<object>} list Items to search.
   * @param {string|number} wiki Name or ID to match.
   * @returns {object} Matching list item.
   * @throws {Error} If no item matches.
   */
  findWikiInList(list, wiki) {
    try {
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
    } catch (error) {
      log.error(`findWikiInList failed: ${error}`);
      throw error;
    }
  }

  /**
   * Fetches HTML and inserts its first `div` into the target element.
   * Promise-chain errors are logged but not rethrown.
   * @param {string} url URL of the HTML document to load.
   * @param {string} targetElementId ID of the element that receives the `div`.
   */
  loadDivFromUrl(url, targetElementId) {
    try {
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
    } catch (error) {
      log.error(`loadExternalDiv failed: ${error}`);
      throw error;
    }
  }

  /**
   * Passes a scoped-object update to the player component.
   * @param {object} newObject Updated scoped object.
   * @throws Rethrows errors from the component update method.
   */
  updateScopedObject(newObject) {
    try {
      this.component.updateScopedObject(newObject);
    } catch (error) {
      log.error(`updateScopedObject failed: ${error}`);
      throw error;
    }
  }

  /**
   * Passes an object update to the player component.
   * @param {object} newObject Updated object.
   * @throws Rethrows errors from the component update method.
   */
  updateObject(newObject) {
    try {
      this.component.updateObject(newObject);
    } catch (error) {
      log.error(`updateObject failed: ${error}`);
      throw error;
    }
  }

  /**
   * Updates one counter and refreshes the component's dynamic objects.
   * @param {object} newCounter Counter value to set.
   * @throws Rethrows errors from updating the counter or component state.
   */
  updateDynamicObject(newCounter) {
    try {
      this.dynamicObject.setCounter(newCounter);
      this.component.updateDynamicObjects(this.dynamicObject.data);
    } catch (error) {
      log.error(`updateDynamicObject failed: ${error}`);
      throw error;
    }
  }

  /**
   * Passes updated dynamic objects to the player component.
   * @param {Array<object>} newCounters Dynamic-object data to apply.
   * @throws Rethrows errors from the component update method.
   */
  updateDynamicObjects(newCounters) {
    try {
      this.component.updateDynamicObjects(newCounters);
    } catch (error) {
      log.error(`updateDynamicObjects failed: ${error}`);
      throw error;
    }
  }

  /**
   * Creates a one-shot timer that invokes the callback after the requested timeout.
   * @param {number} frequencyMs Delay in milliseconds.
   * @param {function(TimerInfo): void} callback Function invoked when the timer expires.
   * @returns {string} Timer key usable with `getTimerStatus` or `destroyTimer`.
   */
  createOneShotTimer(frequencyMs, callback) {
    const key = `oneshot-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    this.timerInfo[key] = {
      startedAt: Date.now(),
      lastFiredAt: null,
      periodMs: frequencyMs,
    };

    this.timers[key] = setTimeout(() => {
      try {
        log.debug(`one-shot timer '${key}' activation`);

        if (callback != null) {
          callback(this.timerInfo[key]);
        }
      } catch (error) {
        log.error(`one-shot timer '${key}' callback failed: ${error}`);
      }

      this.destroyTimer(key);
    }, frequencyMs);

    log.debug(`created one-shot timer '${key}' in ${frequencyMs} ms`);
    return key;
  }

  /**
   * Creates a recurring timer that invokes the callback at the requested interval.
   * @param {number} frequencyMs Interval in milliseconds.
   * @param {function(TimerInfo): void} callback Function invoked immediately and on each interval.
   * @returns {string} Timer key usable with `getTimerStatus` or `destroyTimer`.
   */
  createRecurringTimer(frequencyMs, callback) {
    const key = `recurring-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    this.destroyTimer(key);
    const now = Date.now();

    this.timerInfo[key] = {
      startedAt: now,
      lastFiredAt: now,
      periodMs: frequencyMs,
    };

    if (callback != null) {
      callback(this.timerInfo[key]);
    }

    this.timers[key] = setInterval(() => {
      try {
        log.debug(`recurring timer '${key}' activation`);
        this.timerInfo[key].lastFiredAt = Date.now();

        if (callback != null) {
          callback(this.timerInfo[key]);
        }
      } catch (error) {
        log.error(`recurring timer '${key}' callback failed: ${error}`);
      }
    }, frequencyMs);

    log.debug(`created recurring timer '${key}' frequency ${frequencyMs} ms`);
    return key;
  }

  /**
   * Cancels a timer and removes its timer and status records.
   * @param {string} key Timer key returned by a timer-creation method.
   */
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

  /**
   * Gets elapsed time and time until the next callback for a timer.
   * @param {string} key Timer key returned by a timer-creation method.
   * @returns {{elapsedMs: number, sinceLastCallMs: number, remainingMs: number}|null} Status, or null if unknown or a one-shot has fired.
   */
  getTimerStatus(key) {
    try {
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
    } catch (error) {
      log.error(`getTimerStatus failed: ${error}`);
      return null;
    }
  }

  /**
   * Registers and tracks a DOM event listener using the key `<id>:<eventName>`.
   * Does nothing if that key is already registered.
   * @param {string} id ID of the DOM element.
   * @param {string} eventName DOM event name.
   * @param {Function} callback Event listener.
   * @throws {Error} If the element does not exist.
   */
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

  /**
   * Removes a tracked DOM event listener.
   * @param {string} key Listener key in the form `<id>:<eventName>`.
   */
  destroyEventHandler(key) {
    // test if handler exists
    if (this.events.hasOwnProperty(key)) {
      let item = this.events[key];
      item.element.removeEventListener(item.eventName, item.callback);
      delete this.events[key];

      log.debug(`destroyed handler '${key}'`);
    }
  }

  /**
   * Assigns a click handler to a DOM element, replacing its existing `onclick` handler.
   * Does nothing if the element is not found.
   * @param {string} id ID of the DOM element.
   * @param {Function} callback Click handler.
   */
  onClick(id, callback) {
    var element = document.getElementById(id);
    if (element != null) {
      element.onclick = callback;
      log.debug(`added event '${id}' onclick handler`);
    }
    // this.onEvent(id, "click", callback);
  }

  /**
   * Registers a tracked DOM event handler.
   * @param {string} id ID of the DOM element.
   * @param {string} eventName DOM event name.
   * @param {Function} callback Event listener.
   * @throws {Error} If the element does not exist.
   */
  onEvent(id, eventName, callback) {
    this.createEventHandler(id, eventName, callback);
  }

  /**
   * Logs the IDs of all DOM elements that have an `id` attribute.
   * @returns {void|null} Null if querying the document fails.
   */
  getOLabObjectList() {
    try {
      log.debug(`Id elements list:`);

      var elements = document.querySelectorAll("*[id]");
      elements.forEach((element) => {
        log.debug(`  ${element.id}`);
      });
    } catch (error) {
      log.error(`getOLabObjectList failed: ${error}`);
      return null;
    }
  }

  /**
   * Creates a DOM-object wrapper for the element with the given ID.
   * @param {string} id ID of the DOM element.
   * @returns {OLabApiDomObject|null} Wrapper, or null if creation fails.
   */
  getDomObject(id) {
    try {
      return new OLabApiDomObject(this, id);
    } catch (error) {
      log.error(`getDomObject failed for '${id}': ${error}`);
      return null;
    }
  }

  /**
   * Looks up a script in the scoped-object collection.
   * @param {string|number} name Script name or ID.
   * @returns {object|null} Matching script, or null if missing or lookup fails.
   */
  getScript(name) {
    try {
      const item = this.scopedObject.getObject(ScopedObject.SCRIPTS, name);
      if (item == null) {
        log.error(`Could not find script '${name}'`);
      }
      return item;
    } catch (error) {
      log.error(`getScript failed for '${name}': ${error}`);
      return null;
    }
  }

  /**
   * Looks up a link wikitag in the current node.
   * @param {string|number} id Link ID or name.
   * @returns {OLabApiLink|null} Link wrapper, or null if creation fails.
   */
  getLink(id) {
    try {
      return new OLabApiLink(this, id);
    } catch (error) {
      log.error(`getLink failed for '${id}': ${error}`);
      return null;
    }
  }

  /**
   * Looks up a counter wikitag in the current node.
   * @param {string|number} id Counter ID or name.
   * @returns {OLabApiCounter|null} Counter wrapper, or null if creation fails.
   */
  getCounter(id) {
    try {
      return new OLabApiCounter(this, id);
    } catch (error) {
      log.error(`getCounter failed for '${id}': ${error}`);
      return null;
    }
  }

  /**
   * Looks up a constant wikitag in the current node.
   * @param {string|number} id Constant ID or name.
   * @returns {OLabApiConstant|null} Constant wrapper, or null if creation fails.
   */
  getConstant(id) {
    try {
      return new OLabApiConstant(this, id);
    } catch (error) {
      log.error(`getConstant failed for '${id}': ${error}`);
      return null;
    }
  }

  /**
   * Looks up a slider-question wikitag in the current node.
   * @param {string|number} id Question ID or name.
   * @returns {OLabApiSliderQuestion|null} Wrapper, or null if creation fails.
   */
  getSliderQuestion(id) {
    try {
      return new OLabApiSliderQuestion(this, id);
    } catch (error) {
      log.error(`getSliderQuestion failed for '${id}': ${error}`);
      return null;
    }
  }

  /**
   * Looks up a dropdown-question wikitag in the current node.
   * @param {string|number} id Question ID or name.
   * @returns {OLabApiDropdownQuestion|null} Wrapper, or null if creation fails.
   */
  getDropDownQuestion(id) {
    try {
      return new OLabApiDropdownQuestion(this, id);
    } catch (error) {
      log.error(`getDropDownQuestion failed for '${id}': ${error}`);
      return null;
    }
  }

  /**
   * Looks up a drag-and-drop question wikitag in the current node.
   * @param {string|number} id Question ID or name.
   * @returns {OLabApiDragAndDropQuestion|null} Wrapper, or null if creation fails.
   */
  getDragAndDropQuestion(id) {
    try {
      return new OLabApiDragAndDropQuestion(this, id);
    } catch (error) {
      log.error(`getDragAndDropQuestion failed for '${id}': ${error}`);
      return null;
    }
  }

  /**
   * Looks up a text-question wikitag in the current node.
   * @param {string|number} id Question ID or name.
   * @returns {OLabApiTextQuestion|null} Wrapper, or null if creation fails.
   */
  getTextQuestion(id) {
    try {
      return new OLabApiTextQuestion(this, id);
    } catch (error) {
      log.error(`getTextQuestion failed for '${id}': ${error}`);
      return null;
    }
  }

  /**
   * Looks up a multiple-choice question wikitag in the current node.
   * @param {string|number} id Question ID or name.
   * @returns {OLabApiMultipleChoiceQuestion|null} Wrapper, or null if creation fails.
   */
  getMultipleChoiceQuestion(id) {
    try {
      return new OLabApiMultipleChoiceQuestion(this, id);
    } catch (error) {
      log.error(`getMultipleChoiceQuestion failed for '${id}': ${error}`);
      return null;
    }
  }

  /**
   * Looks up a single-choice question wikitag in the current node.
   * @param {string|number} id Question ID or name.
   * @returns {OLabApiSingleChoiceQuestion|null} Wrapper, or null if creation fails.
   */
  getSingleChoiceQuestion(id) {
    try {
      return new OLabApiSingleChoiceQuestion(this, id);
    } catch (error) {
      log.error(`getSingleChoiceQuestion failed for '${id}': ${error}`);
      return null;
    }
  }

  /**
   * Navigates to another node in the current map.
   * @param {number|string} nodeId Destination node ID.
   * @param {Function|null} [onShutdownCallback=null] Optional callback invoked after cleanup.
   */
  jumpToNode(nodeId, onShutdownCallback = null) {
    const currentNodeId = this.getNodeId();
    if (currentNodeId === nodeId) {
      log.debug(`jumpToNode(${nodeId}) already at node. no action taken.`);
      return;
    }
    const currentMapId = this.getMapId();
    this.shutdown(onShutdownCallback);

    log.debug(`jumpToNode(${nodeId}), map ${currentMapId}`);

    this.props.onNavigateToNode(currentMapId, nodeId, "");
  }

  #destroyAllEventHandlers() {
    try {
      var keys = Object.keys(this.events);
      for (let key of keys) {
        this.destroyEventHandler(key);
      }
    } catch (error) {
      log.error(`destroyAllEventHandlers failed: ${error}`);
      throw error;
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
}
