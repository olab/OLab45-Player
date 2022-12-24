import log from 'loglevel';
import Participant from '../../../helpers/participant';
import SlotInfo from '../../../helpers/SlotInfo';

class SlotManager {

  // *****
  constructor(count) {

    this.remoteSlots = [];
    this.localSlots = [];

    for (let index = 0; index < count; index++) {

      var slot = new SlotInfo( { key: index });
      this.remoteSlots.push(slot);
      this.localSlots.push(slot);
    }

  }

  // *****
  RemoteSlots() {
    return this.remoteSlots;
  }

  // *****
  getSlotByConnectionId(connectionId) {

    try {

      for (let item of this.RemoteSlots()) {
        if (item.connectionId === connectionId)
          return item;
      }

      log.error(`could not find chat info for connection Id ${connectionId}`);

    } catch (error) {
      log.error(`getSlotByConnectionId exception: ${error.message}`);
    }

    return null;
  }

  // *****
  getSlotByUserId(userId) {

    try {

      for (let item of this.RemoteSlots()) {
        if (item.userId === userId)
          return item;
      }

      log.error(`could not find chat info for userId ${userId}`);

    } catch (error) {
      log.error(`getSlotByUserId exception: ${error.message}`);
    }

    return null;
  }

  // *****
  getSlotByKey(key) {

    try {

      for (let item of this.RemoteSlots()) {
        if (item.key === key)
          return item;
      }

      log.error(`could not find chat info for key ${key}`);

    } catch (error) {
      log.error(`getPropByKey exception: ${error.message}`);
    }

    return null;
  }

  // Get index of next open chat control or
  // find one user was already in
  getOpenSlotIndex() {

    try {

      for (let slot of this.RemoteSlots()) {
        if (slot.isOpen()) {
          return slot.key;
        }
      }

    } catch (error) {
      log.error(`getOpenInfoSlot exception: ${error.message}`);
    }

    return null;
  }

  // *****
  assignLearner(newLearner) {

    let index = this.getOpenSlotIndex();
    if (index == null) {
      throw new Error(`No available slots to assign learner ${learner.userId} `);
    }

    log.debug(`assigning '${newLearner.userId}' to slot ${index}`);

    let slot = this.RemoteSlots()[index];
    let learner = new Participant(newLearner);

    slot.assigned = false;
    slot.show = false;
    slot.SetParticipant(learner);

    log.debug(`assignLearner: ${learner.toString()}`);

    return this.RemoteSlots()[index];
  }

};

export default SlotManager;
