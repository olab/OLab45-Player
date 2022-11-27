import log from 'loglevel';

class ChatPropManager {

  // *****
  constructor(count, infoTemplate) {

    this.connectionInfos = [];

    // initialize local/remote info arrays for every chat box
    for (let index = 0; index < count; index++) {  
      var item = Object.assign({}, infoTemplate);
      item.key = index;   
      this.connectionInfos.push(item);
    }

  }

  // *****
  getProps() {
    return this.connectionInfos;
  }

  // *****
  getPropByKey(key) {

    try {

      for (let item of this.getProps()) {
        if (item.key === key)
          return item;
      }

    } catch (error) {
      log.error(`getPropByKey exception: ${error.message}`);
    }

    return null;
  }

  // *****
  getOpenInfoSlot() {

    try {

      for (let item of this.getProps()) {
        if (item.learnerInfo.NickName == null) {
          return index;
        }
      }

    } catch (error) {
      log.error(`getOpenInfoSlot exception: ${error.message}`);
    }

    return null;
  }

  // *****
  assignLearner(learnerInfo) {

    const index = this.getOpenInfoSlot();
    if (index == null) {
      throw new Error(`No available slots to assign learner ${learnerInfo.Name} `);
    }

    log.debug(`assigning ${learnerInfo.Name} to chat slot ${index}`);

    getProps()[index].remoteInfo.Name = learnerInfo.Name;
    getProps()[index].remoteInfo.ConnectionId = learnerInfo.ConnectionId;
    getProps()[index].remoteInfo.Id = learnerInfo.Id;

    log.debug(`assignTurkee: ${JSON.stringify(getProps()[index], null, 2)}`);

    return getProps()[index];
  }

};

export default ChatPropManager;
