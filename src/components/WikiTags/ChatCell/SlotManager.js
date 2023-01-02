import log from 'loglevel';
import Participant from '../../../helpers/participant';
import SlotInfo from '../../../helpers/SlotInfo';
const persistantStorage = require('../../../utils/StateStorage').PersistantStateStorage;

class SlotManager {

  // *****
  constructor(count, slotTemplate = null) {

    var slotInfos = persistantStorage.get('slotInfos', []);

    this.remoteSlots = [];
    this.localSlots = [];

    this.haveAssigned = false;
    this.haveLocalAssigned = false;

    // if have no saved slots, initialize a 
    // new list of slots
    if (slotInfos.length == 0) {

      // initialize slot (either use default or 
      // use the template passed in)
      for (let index = 0; index < count; index++) {

        var slot = new SlotInfo();

        // overlay template on new object
        if (slotTemplate) {
          slot.SetParticipant(slotTemplate);
        }

        // set flag that there is at least
        // one assigned slot
        if (slot.assigned) {
          this.haveAssigned = true;
        }

        slot.key = index;
        this.remoteSlots.push(slot);

      }

    }
    else {

      for (let index = 0; index < count; index++) {
        var slot = new SlotInfo(slotInfos[index]);

        // set flag that there is at least
        // one assigned slot
        if (slot.assigned) {
          this.haveAssigned = true;
        }

        slot.key = index;
        this.remoteSlots.push(slot);
      }
    }

    persistantStorage.save(
      'slotInfos',
      this.remoteSlots);

  }

  // *****
  Slots() {
    return this.remoteSlots;
  }

  // *****
  LocalSlots() {
    return this.localSlots;
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

  assignLocalInfo(localInfo) {

    // make copy of localInfo so it can be modified per slot

    for (let index = 0; index < this.Slots().length; index++) {

      // create editable copy of localInfo
      let slotLocalInfo = new SlotInfo(localInfo);      

      slotLocalInfo.show = false;
      slotLocalInfo.assigned = false;      
      slotLocalInfo.key = index;

      this.localSlots.push(slotLocalInfo);
    }

    this.haveLocalAssigned = true;

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

    this.haveAssigned = true;
    slot.SetParticipant(learner);

    let localInfo = this.LocalSlots()[index];
    localInfo.show = true;
    localInfo.assigned = true;
    localInfo.commandChannel = newLearner.commandChannel;

    log.debug(`assignLearner: ${learner.toString()}`);

    return this.Slots()[index];
  }

};

export default SlotManager;
