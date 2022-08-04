import log from 'loglevel';

class ChatPropManager {

  // *****
  constructor(count, localInfoTemplate) {

    this.connectionInfos = [];

    // initialize local/remote info arrays for every chat box
    for (let index = 0; index < count; index++) {
      this.connectionInfos.push({
        key: index,
        localInfo: {
          Name: localInfoTemplate.Name, ConnectionId: localInfoTemplate.ConnectionId
        },
        remoteInfo: {
          Name: '', ConnectionId: ''
        }
      });
    }

  }

  getProps() {
    // log.debug(`getProps: ${JSON.stringify(this.connectionInfos, null, 1)}`);
    return this.connectionInfos;
  }

  // *****
  createData(key, message, isLocalMessage) {
    return { key, message, isLocalMessage };
  }

  setConnectionId( connectionId )
  {
    for (let index = 0; index < this.connectionInfos.length; index++) {
      this.connectionInfos[index].localInfo.ConnectionId = connectionId;
    }
  }

  // *****
  getPropByKey(key) {

    for (let index = 0; index < this.connectionInfos.length; index++) {
      const element = this.connectionInfos[index];
      if (element.key === key)
        return element;
    }

    return null;
  }

  getOpenInfoSlot() {

    try {

      for (let index = 0; index < this.connectionInfos.length; index++) {
        const element = this.connectionInfos[index];
        if (element.remoteInfo.ConnectionId === '') {
          return index;
        }
      }

    } catch (error) {
      log.error(`getOpenInfoSlot exception: ${error.message}`);
    }

    return null;
  }

  // *****
  getPropByConnectionId(connectionId) {

    for (let index = 0; index < this.connectionInfos.length; index++) {
      const element = this.connectionInfos[index];
      if (element.remoteInfo.ConnectionId === connectionId) {
        return element;
      }
    }

    return null;
  }

  assignTurkee(turkeeInfo) {

    const index = this.getOpenInfoSlot();
    if (index == null) {
      throw new Error(`No available slots to assign turkee ${turkeeInfo.Name} `);
    }

    log.debug(`assigning ${turkeeInfo.Name} to chat slot ${index}`);
    
    this.connectionInfos[index].remoteInfo.Name = turkeeInfo.Name;
    this.connectionInfos[index].remoteInfo.ConnectionId = turkeeInfo.ConnectionId;
    this.connectionInfos[index].remoteInfo.Id = turkeeInfo.Id;

    log.debug(`assignTurkee: ${JSON.stringify(this.connectionInfos[index], null, 2)}`);

    return this.connectionInfos[index];
  }

  // ***** 
  assignMessage(envelope, message, isEchoMessage) {

    var turkeeProp = this.getPropByConnectionId(envelope.ToId);

    if (!turkeeProp) {
      throw new Error(`Cannot find turkee '${envelope.Name}' in active list`)
    }

    turkeeProp.conversation.push(this.createData(turkeeProp.conversation.length, message, isEchoMessage));

    log.debug(`assignMessage: ${JSON.stringify(turkeeProp)}`);

    return turkeeProp;

  }

};

export default ChatPropManager;
