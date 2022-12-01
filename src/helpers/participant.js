import log from 'loglevel';

class Participant {

  constructor(source = null) {

    this.userId = null;
    this.topicName = null;
    this.nickName = null;
    this.connectionId = null;
    this.roomName = null;
    this.commandChannel = null;

    if (source) {
      Object.assign(this, { ...this, ...source });
    }
  }

  toString(log) {
    return `${this.userId} ${this.connectionId?.split(-3)}`;
  }
}

export default Participant;
