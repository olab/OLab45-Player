import log from 'loglevel';
import Participant from '../../../../helpers/participant';
import SlotInfo from '../../../../helpers/SlotInfo';
const persistantStorage = require('../../../../utils/StateStorage').PersistantStateStorage;

class SlotManager {

  // *****
  constructor(count, slotTemplate = null) {

    // TODO: add this for connection recovery later
    // var { remoteSlots, localSlots } = persistantStorage.get(
    //   'slotState',
    //   {
    //     remoteSlots: [],
    //     localSlots: []
    //   });
    let remoteSlots = [];
    let localSlots = [];

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

        this.localSlots.push(slot);

        // clone the slot so we can apply the slot template
        // to a separate object
        slot = new SlotInfo();
        slot.key = index;

        // overlay template on new object
        if (slotTemplate) {
          slot.SetParticipant(slotTemplate);
        }

        this.remoteSlots.push(slot);

      }

      // TODO: add this for connection recovery later
      // update the slot state in storage
      // persistantStorage.save(
      //   'slotState',
      //   {
      //     remoteSlots: this.remoteSlots,
      //     localSlots: this.localSlots
      //   }
      // );

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
  RemoteSlots() {
    return this.remoteSlots;
  }

  // *****
  LocalSlots() {
    return this.localSlots;
  }

  assignLocalInfo(localInfo) {

    // make copy of localInfo so it can be modified per slot

    for (let index = 0; index < this.LocalSlots().length; index++) {

      // overwrite the local info array
      let slotLocalInfo = new SlotInfo(localInfo);
      slotLocalInfo.key = index;

      this.LocalSlots()[index] = slotLocalInfo;
    }

  }

  // *****
  getRemoteSlotByConnectionId(connectionId) {

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
  getRemoteSlotByUserId(userId) {

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
  getRemoteSlotByKey(key) {

    try {

      for (let item of this.RemoteSlots()) {
        if (item.key === key)
          return item;
      }

      log.error(`could not find chat info for key ${key}`);

    } catch (error) {
      log.error(`getSlotByKey exception: ${error.message}`);
    }

    return null;
  }

  // Get index of next open chat control or
  // find one user was already in
  getOpenRemoteSlotIndex() {

    try {

      for (let slot of this.RemoteSlots()) {
        if (!slot.assigned) {
          return slot.key;
        }
      }

    } catch (error) {
      log.error(`getOpenInfoSlot exception: ${error.message}`);
    }

    return null;
  }

  // unassign a (remote) conversation
  unassignLearner(payload) {

    // get chat for connection id.  when found, mark the chat
    // as disconnected.
    let slotInfo = this.getRemoteSlotByConnectionId(payload.connectionId);
    if (slotInfo) {
      // blank out slot
      slotInfo = new SlotInfo({ key: slotInfo.key });
      this.RemoteSlots()[slotInfo.key] = slotInfo;
    }

    return {
      remoteSlots: this.RemoteSlots(),
      localSlots: this.LocalSlots()
    }

  }

  // *****
  assignLearner(localInfo, remoteInfo) {

    let index = this.getOpenRemoteSlotIndex();
    if (index == null) {
      throw new Error(`No available slots to assign learner ${remoteInfo.userId} `);
    }

    log.debug(`assigning '${remoteInfo.userId}' to slot ${index}`);

    let remoteSlot = this.RemoteSlots()[index];
    let participant = new SlotInfo(remoteInfo);
    participant.show = true;
    participant.assigned = true;
    remoteSlot.SetParticipant(participant);

    this.haveAssigned = true;

    // clone the localInfo so we can set it's properties
    // per slot
    participant = new SlotInfo(localInfo);
    participant.key = index;
    participant.show = true;    
    participant.assigned = true;

    this.LocalSlots()[index] = participant;

    log.debug(`assignLearner: ${participant.toString()}`);

    return {
      remoteSlots: this.RemoteSlots(),
      localSlots: this.LocalSlots()
    }
  }

};

export default SlotManager;
