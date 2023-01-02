import log from 'loglevel';
import Participant from './participant';

class SlotInfo {

  constructor(source) {
    this.key = null;
    this.show = false;
    this.assigned = false;
    this.lastMessageTime = '-';

    var tmp = new Participant();
    Object.assign(this, { ...this, ...tmp });   
        
    if (source) {
      Object.assign(this, { ...this, ...source });
    }
 
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

  isEmpty() {
    return !this.userId;
  }
}

export default SlotInfo;