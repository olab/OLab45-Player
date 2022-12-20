import log from 'loglevel';
import Participant from './participant';

class SlotInfo {

  constructor(source) {
    this.key = null;
    this.show = false;
    this.assigned = false;
    this.lastMessageTime = '-';

    if (source) {
      Object.assign(this, { ...this, ...source });
    }

    var tmp = new Participant();
    Object.assign(this, { ...this, ...tmp });    
  }

  isOpen() {
    return !this.assigned;
  }

  SetParticipant(learner)
  {
    // save the key from being overwriten
    var slotKey = this.key;
    Object.assign(this, { ...this, ...learner });        
    this.key = slotKey;
  }
}

export default SlotInfo;