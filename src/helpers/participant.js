import { Log, LogInfo, LogError } from '../utils/Logger';
import log from 'loglevel';

class Participant {

  constructor(source = null) {

    this.userId = null;
    this.topicName = null;
    this.nickName = null;
    this.connectionId = null;
    this.roomName = null;
    this.commandChannel = null;
    this.isModerator = null;

    if (source) {
      Object.assign(this, { ...this, ...source });
    }
  }

  toString() {
    return `${this.userId} ${this.connectionId?.slice(-3)} moderator? ${this.isModerator}`;
  }
}

export default Participant;
