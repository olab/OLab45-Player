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
      this.slots.push(item);
    }

  }

  // *****
  Slots() {
    return this.slots;
  }

  // *****
  getSlotByKey(key) {

    try {

      for (let item of this.Slots()) {
        if (item.key === key)
          return item;
      }

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

    log.debug(`assigning '${learner.userId}' to slot ${index}`);

    let learner = this.Slots()[index];
    learner.connected = true;
    learner = new Participant( newLearner );

    log.debug(`assignLearner: ${JSON.stringify(this.Slots()[index], null, 2)}` );

    return this.Slots()[index];
  }

};

export default ChatPropManager;
