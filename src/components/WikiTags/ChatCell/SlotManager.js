import log from 'loglevel';
import Participant from '../../../helpers/participant';
import SlotInfo from '../../../helpers/SlotInfo';

class SlotManager {

  // *****
  constructor(count, slotTemplate = null) {

    this.slots = [];

    // initialize slot (either use default or 
    // use the template passed in)
    for (let index = 0; index < count; index++) {

      var slot = new SlotInfo();

      // overlay template on new object
      if (slotTemplate) {
        slot.SetParticipant(slotTemplate);
      }

      slot.key = index;

      this.slots.push(slot);
    }

  }

  // *****
  Slots() {
    return this.slots;
  }

  // *****
  getSlotByConnectionId(connectionId) {

    try {

      for (let item of this.Slots()) {
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

      for (let item of this.Slots()) {
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

      for (let item of this.Slots()) {
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

      for (let slot of this.Slots()) {
        if (!slot.assigned) {
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

    let slot = this.Slots()[index];
    let learner = new Participant(newLearner);

    slot.assigned = true;
    slot.show = true;

    slot.SetParticipant(learner);

    log.debug(`assignLearner: ${learner.toString()}`);

    return this.Slots()[index];
  }

};

export default SlotManager;
