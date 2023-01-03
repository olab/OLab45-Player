import log from 'loglevel';
import Participant from '../../../helpers/participant';
import SlotInfo from '../../../helpers/SlotInfo';
const persistantStorage = require('../../../utils/StateStorage').PersistantStateStorage;

class SlotManager {

  // *****
  constructor(count, slotTemplate = null) {

    var { remoteSlots, localSlots } = persistantStorage.get(
      'slotState',
      {
        remoteSlots: [],
        localSlots: []
      });

    this.haveAssigned = false;
    this.haveLocalAssigned = false;
    this.remoteSlots = [];
    this.localSlots = [];

    // if have no saved slots, initialize a 
    // new list of slots
    if (localSlots.length == 0) {      

      // initialize slot (either use default or 
      // use the template passed in)
      for (let index = 0; index < count; index++) {

        var slot = new SlotInfo();
        slot.key = index;

        this.localSlots.push(Object.assign({}, slot));

        // overlay template on new object
        if (slotTemplate) {
          slot.SetParticipant(slotTemplate);
        }

        // set flag that there is at least
        // one assigned slot
        if (slot.assigned) {
          this.haveAssigned = true;
        }

        this.remoteSlots.push(slot);

      }

      // update the slot state in storage
      persistantStorage.save(
        'slotState',
        {
          remoteSlots: this.remoteSlots,
          localSlots: this.localSlots
        }
      );

    }
    else {

      // make objects read from storage full
      // SlotInfo objects again
      for (let index = 0; index < count; index++) {

        this.remoteSlots.push(new SlotInfo(remoteSlots[index]));
        this.localSlots.push(new SlotInfo(localSlots[index]));

        // set flag that there is at least
        // one assigned slot
        if (localSlots[index].assigned) {
          this.haveAssigned = true;
        }
      }
    }

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

      for (let slot of this.LocalSlots()) {
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

    for (let index = 0; index < this.LocalSlots().length; index++) {

      // overwrite the local info array
      let slotLocalInfo = new SlotInfo(localInfo);
      slotLocalInfo.key = index;

      this.LocalSlots()[index] = slotLocalInfo;
    }

    this.haveLocalAssigned = true;

  }

  // *****
  assignLearner(localInfo, newLearner) {

    let index = this.getOpenSlotIndex();
    if (index == null) {
      throw new Error(`No available slots to assign learner ${newLearner.userId} `);
    }

    log.debug(`assigning '${newLearner.userId}' to slot ${index}`);

    let slot = this.Slots()[index];
    let learner = new Participant(newLearner);

    this.haveAssigned = true;
    slot.SetParticipant(learner);

    // clone the localInfo so we can set it's properties
    // per slot
    let newLocalInfo = Object.assign({}, localInfo);
    newLocalInfo.show = true;
    newLocalInfo.assigned = true;
    newLocalInfo.commandChannel = newLearner.commandChannel;
    this.LocalSlots()[index] = newLocalInfo;

    log.debug(`assignLearner: ${learner.toString()}`);

    return {
      remoteSlot: this.Slots()[index],
      localSlot: this.LocalSlots()[index]
    }
  }

};

export default SlotManager;
