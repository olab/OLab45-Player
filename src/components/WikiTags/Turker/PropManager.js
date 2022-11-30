import log from 'loglevel';

class ChatPropManager {

  // *****
  constructor(count) {

    this.connectionInfos = [];
    const infoTemplate = {
      key: null,
      nickName: null,
      groupName: null,
      learner: {},
      connected: false
    };

    // initialize local/remote info arrays for every chat box
    for (let index = 0; index < count; index++) {

      // make a copy of the object so it can be modified  
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

      const connectionInfos = this.getProps();

      for (let item of connectionInfos) {
        if (!item.NickName) {
          return item.key;
        }
      }

    } catch (error) {
      log.error(`getOpenInfoSlot exception: ${error.message}`);
    }

    return null;
  }

  // *****
  assignLearner(roomInfo, learner) {

    const index = this.getOpenInfoSlot();
    if (index == null) {
      throw new Error(`No available slots to assign learner ${learner.userId} `);
    }

    log.debug(`assigning '${learner.nickName}' to chat slot ${index}`);

    let chatInfo = this.getProps()[index];
    chatInfo.learner = learner;
    chatInfo.nickName = learner.nickName;
    chatInfo.groupName = learner.commandChannel;
    chatInfo.connected = true;

    log.debug(`assignLearner: ${JSON.stringify(this.getProps()[index], null, 2)}` );

    return chatInfo;
  }

};

export default ChatPropManager;
