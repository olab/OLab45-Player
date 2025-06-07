import log from "loglevel";
import { config } from "../config";

class DynamicObject {
  #dynamicObject = null;

  constructor(dynamicObject = null) {
    if (dynamicObject == null) {
      dynamicObject = {
        checksum: null,
        newPlay: false,
        counters: [],
        nodesVisitedList: [],
        updatedAt: null,
      };
    }

    this.#dynamicObject = dynamicObject;
    this.#decorateCounters();
  }

  get data() {
    return this.#dynamicObject;
  }

  clone() {
    return { ...data };
  }

  update(dynamicObject) {
    this.#dynamicObject = dynamicObject;
    this.#decorateCounters();
  }

  #decorateCounters() {
    for (let counter of this.getCounters()) {
      if (!counter.htmlIdBase) {
        if (counter.name != null) {
          counter.htmlIdBase = `CR:${counter.name}`;
        } else {
          counter.htmlIdBase = `CR:${counter.id}`;
        }
      }
    }
  }

  getCounter(id, copy = false) {
    for (let counter of this.getCounters()) {
      if (
        counter.name === id ||
        counter.id === Number(id) ||
        counter.htmlIdBase == id
      ) {
        if (copy === true) {
          return { ...counter };
        }
        return counter;
      }
    }

    return null;
  }

  getCounters(copy = false) {
    var counters = this.data.counters ? this.data.counters : [];
    if (copy === true) {
      return [...counters];
    }

    return counters;
  }

  getChecksum() {
    return this.data.checksum;
  }

  setNewPlay(value) {
    this.data.newPlay = value;
  }

  getNewPlay() {
    return this.data.newPlay;
  }
}

export { DynamicObject };
