import log from 'loglevel';
import Participant from '../../../helpers/participant';

class ChatPropManager {

  // *****
  constructor(count) {

    this.slots = [];

    for (let index = 0; index < count; index++) {

      var item = new Participant();

      item.key = index;   
      item.connected = false; 
      item.show = false;  
      item.lastMessageTime = '-';
      this.slots.push(item);
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

  /// Get index of next open chat control
  getOpenSlot() {

    try {

      const learners = this.Slots();

      for (let item of learners) {
        if (!item.connected) {
          return item.key;
        }
      }

    } catch (error) {
      log.error(`getOpenInfoSlot exception: ${error.message}`);
    }

    return null;
  }

  // *****
  assignLearner(newLearner) {

    const index = this.getOpenSlot();
    if (index == null) {
      throw new Error(`No available slots to assign learner ${learner.userId} `);
    }

    log.debug(`assigning '${newLearner.userId}' to slot ${index}`);

    let learner = new Participant( newLearner );
    learner.connected = true;
    learner.show = true;

    this.Slots()[index] = learner;

    log.debug(`assignLearner: ${learner.toString()}` );

    return this.Slots()[index];
  }

};

export default ChatPropManager;
