import { Log, LogInfo, LogError, LogException } from "../../../../utils/Logger";
import log from "loglevel";
import Participant from "../../../../helpers/participant";
import SlotInfo from "../../../../helpers/SlotInfo";
import ChatCell from "../../../ChatCell/ChatCell";

class ChatCellData {
  constructor(key, localInfo, remoteInfo = null) {
    this.key = key;
    this.show = false;
    this.assigned = false;
    this.session = {
      contextId: null,
    };

    this.localInfo = new SlotInfo(localInfo);
    if (!remoteInfo) {
      this.remoteInfo = new SlotInfo(remoteInfo);
    } else {
      this.remoteInfo = remoteInfo;
    }
  }

  toString() {
    return `${JSON.stringify(this, null, 1)}`;
  }
}

class ChatCellManager {
  constructor(props) {
    this.props = props;
    this.chatCells = [];
    this.chatDatas = [];

    // this defines the max number of turkees
    // for the turker
    this.MAX_TURKEES = this.props.totalCount;
    this.NUM_ROWS = this.props.numRows;
    this.numColumns = this.MAX_TURKEES / this.NUM_ROWS;

    // set the jump nodes for the room
    this.jumpMapNodes = this.props.jumpMapNodes;

    this.isModerator = this.props.moderator;
    this.connection = this.props.connection;

    // initialize chat cell width
    this.chatCellWidthStyle = this.#calculateChatCellWidth(this.#chatDatas());

    // initialize the chat cell jsx objects
    this.#initializeChatCells(this.MAX_TURKEES, this.props.localInfo);

    Log(`ChatCellManager: initialized ${this.props.totalCount} chat cells`);
  }

  // *****
  chatCells(index = null) {
    if (index == null) {
      return this.chatCells;
    }

    return this.chatCells[index];
  }

  // *****
  #chatDatas(index = null) {
    if (index == null) {
      return this.chatDatas;
    }

    return this.chatDatas[index];
  }

  // recalculate the chat cell width based on the number
  // that are supposed to be active/showing
  #calculateChatCellWidth(chatDatas) {
    let width = {};

    let totalToShow = 0;
    for (let index = 0; index < this.#chatDatas().length; index++) {
      if (this.#chatDatas(index).show) {
        totalToShow++;
      }
    }

    if (!totalToShow) {
      width = { width: "100%" };
    } else if (totalToShow < this.numColumns) {
      width = { width: `${Math.floor(100 / totalToShow)}%` };
    } else {
      width = { width: "25%" };
    }

    Log(`ChatCellManager width style: ${JSON.stringify(width, null, 1)}`);
    return width;
  }

  // initialize chat cell jsx
  #initializeChatCells(count, localInfoTemplate) {
    for (let index = 0; index < count; index++) {
      let chatData = new ChatCellData(index, localInfoTemplate);
      this.chatDatas.push(chatData);

      Log(`init cell[${index}]: ${JSON.stringify(chatData)}`);

      this.chatCells.push(
        <ChatCell
          name="chatcell"
          mapNodes={this.jumpMapNodes}
          session={chatData.session}
          key={index}
          index={index}
          style={this.chatCellWidthStyle}
          isModerator={this.isModerator}
          connection={this.connection}
          localInfo={chatData.localInfo}
          senderInfo={chatData.remoteInfo}
        />
      );
    }
  }

  #recalculateChatCell(index) {
    let chatData = this.#chatDatas(index);
    Log(`recalc cell[${index}]: ${JSON.stringify(chatData, null, 1)}`);

    // reinitialize chat cell width
    this.chatCellWidthStyle = this.#calculateChatCellWidth(this.chatDatas);

    this.chatCells[index] = (
      <ChatCell
        name="chatcell"
        mapNodes={this.jumpMapNodes}
        session={chatData.session}
        key={index}
        index={index}
        style={this.chatCellWidthStyle}
        isModerator={this.isModerator}
        connection={this.connection}
        localInfo={chatData.localInfo}
        senderInfo={chatData.remoteInfo}
      />
    );
  }

  // Get index of next open chat cell or
  // find one user was already in
  #getSlotIndex(remoteInfo) {
    try {
      // first check to see if we are re-using a slot
      // the learner was already in
      for (let chatData of this.#chatDatas()) {
        if (
          !chatData.assigned &&
          chatData.remoteInfo.userId == remoteInfo.userId
        ) {
          return chatData.key;
        }
      }

      // else just look for first unassigned chat cell
      for (let chatData of this.#chatDatas()) {
        if (!chatData.assigned) {
          return chatData.key;
        }
      }
    } catch (error) {
      LogError(`#getOpenInfoSlot exception: ${error.message}`);
    }

    return null;
  }

  // *****
  #getSlotIndexByconnectionId(connectionId) {
    try {
      let index = 0;
      for (let chatData of this.#chatDatas()) {
        if (chatData.remoteInfo.connectionId === connectionId) {
          return index;
        }
        index++;
      }

      LogError(`could not find chat info for connection Id ${connectionId}`);
    } catch (error) {
      LogError(`getSlotIndexByconnectionId exception: ${error.message}`);
    }

    return null;
  }

  assignChatParticipant(remoteInfo) {
    try {
      Log(`assigning ${JSON.stringify(remoteInfo, null, 2)} participant`);

      let index = this.#getSlotIndex(remoteInfo);
      if (index == null) {
        throw new Error(
          `No available slots to assign learner ${remoteInfo.userId} `
        );
      }

      log.debug(`assigning '${remoteInfo.userId}' to slot ${index}`);

      let chatData = this.chatDatas[index];

      chatData.remoteInfo = {
        ...remoteInfo,
        show: true,
        assigned: true,
      };

      chatData.localInfo.show = true;
      chatData.localInfo.assigned = true;

      log.debug(`assignChatParticipant: ${chatData.toString()}`);

      this.#recalculateChatCell(index);
    } catch (error) {
      LogException(`assignChatParticipant`, error);
    }
  }

  // unassign a (remote) conversation
  unassignChatParticipant(payload) {
    try {
      Log(`unassigning ${JSON.stringify(payload, null, 2)} participant`);

      // get chat for connection id. when found, mark the chat
      // as disconnected.
      let index = this.#getSlotIndexByconnectionId(payload.connectionId);

      if (index != null) {
        let chatData = this.#chatDatas(index);
        // blank out slot
        chatData.assigned = false;
        chatData.show = false;
      }

      this.#recalculateChatCell(index);
    } catch (error) {
      LogError(`unassignChatParticipant exception: ${error.message}`);
    }
  }
}

export default ChatCellManager;
