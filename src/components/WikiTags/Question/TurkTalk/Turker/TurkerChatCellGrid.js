// @flow
import * as React from "react";
import { Button, Table, TableBody, TableRow, Grid } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import {
  Log,
  LogInfo,
  LogError,
  LogException,
} from "../../../../../utils/Logger";
import log from "loglevel";
import styles from "../../../styles.module.css";
import localCss from "./TurkerChatCellGrid.module.css";
import TurkerChatStatusBar from "./TurkerChatStatusBar";
import Atrium from "../Atrium/Atrium";
import RememberedLearners from "../RememberedLearners/RememberedLearners";

import SlotManager from "../SlotManager";
import ChatCell from "../../../../ChatCell/ChatCell";
const persistantStorage =
  require("../../../../../utils/PersistantStorage").PersistantStorage;

var constants = require("../../../../../services/constants");

class TurkerChatCellGrid extends React.Component {
  constructor(props) {
    super(props);

    // this defines the max number of turkees
    // for the turker
    this.MAX_TURKEES = 8;
    this.NUM_ROWS = 2;
    this.numColumns = this.MAX_TURKEES / this.NUM_ROWS;

    this.slotManager = this.buildSlotManager();
    this.roomName = this.props.roomName;

    this.state = {
      localSlots: this.slotManager.LocalSlots(),
      remoteSlots: this.slotManager.RemoteSlots(),
      localInfo: this.props.localInfo,
      showChatGrid: false,
      sessionId: null,
      userName: this.props.userName,
    };

    this.connection = this.props.connection;

    this.onAtriumAssignClicked = this.onAtriumAssignClicked.bind(this);
    this.onAtriumUpdate = this.onAtriumUpdate.bind(this);
    this.onCloseClicked = this.onCloseClicked.bind(this);
    this.onPopupMessage = this.onPopupMessage.bind(this);

    var turkerChatCellGridSelf = this;
    if (this.connection) {
      this.connectionId = this.props.connection.connectionId?.slice(-3);
      this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => {
        turkerChatCellGridSelf.onCommand(payload);
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.localInfo !== this.props.localInfo) {
      this.setState({ localInfo: this.props.localInfo });
    }
  }

  buildSlotManager() {
    // test if already have one, if so
    // then do nothing
    if (this.slotManager) {
      return this.slotManager;
    }

    var tempInfo = Object.assign({}, this.props.localInfo);
    tempInfo.commandChannel = null;
    tempInfo.assigned = false;
    tempInfo.show = false;

    return new SlotManager(this.MAX_TURKEES, tempInfo);
  }

  // *****
  onCommand(payload) {
    if (payload.command === constants.SIGNALCMD_LEARNER_ASSIGNED) {
      log.debug(`'onCommand ${this.connectionId}': ${JSON.stringify(payload)}`);
      this.onLearnerAssigned(payload.data);
    } else if (payload.command === constants.SIGNALCMD_ROOMASSIGNED) {
      log.debug(`'onCommand ${this.connectionId}': ${JSON.stringify(payload)}`);
      this.onRoomAssigned(payload.data);
    } else if (payload.command === constants.SIGNALCMD_LEARNER_UNASSIGNED) {
      log.debug(`'onCommand ${this.connectionId}': ${JSON.stringify(payload)}`);
      this.onLearnerUnassigned(payload.data);
    }
  }

  onRoomAssigned(payload) {
    try {
    } catch (error) {
      LogException(`onRoomAssigned`, error);
    }
  }

  // learner has been assigned to the room
  onLearnerAssigned(payload) {
    try {
      const { localInfo } = this.state;

      // the connected learner's command channel becomes
      // our own local channel
      localInfo.commandChannel = payload.learner.commandChannel;

      this.slotManager.assignLearner(
        localInfo,
        payload.learner,
        payload.jumpNodes
      );

      this.setState({
        showChatGrid: true,
        remoteSlots: this.slotManager.RemoteSlots(),
        localSlots: this.slotManager.LocalSlots(),
      });

      // update the slot state in storage
      persistantStorage.save(null, "slotState", {
        remoteSlots: this.slotManager.RemoteSlots(),
        localSlots: this.slotManager.LocalSlots(),
      });
    } catch (error) {
      LogException(`onLearnerAssigned '${this.connectionId}'`, error);
    }
  }

  // learner has disconnected from the topic
  onLearnerUnassigned(payload) {
    try {
      log.debug(
        `onLearnerUnassigned '${
          this.connectionId
        }': connectionId '${JSON.stringify(payload, null, 1)}'`
      );

      let { remoteSlots, localSlots } = this.slotManager.unassignLearner(
        payload.participant
      );

      this.setState({
        remoteSlots: remoteSlots,
        localSlots: localSlots,
      });

      // update the slot state in storage
      persistantStorage.save(null, "slotState", {
        remoteSlots: remoteSlots,
        localSlots: localSlots,
      });
    } catch (error) {
      LogException(`onLearnerUnassigned '${this.connectionId}'`, error);
    }
  }

  // handle learner list (for rebuilding
  // chat cells after a disconnect)
  onLearnerList(payloadArray) {
    try {
      let learners = [];

      // save atrium contents if array passed in
      if (Array.isArray(payloadArray) && payloadArray.length >= 0) {
        let key = 1;
        for (const payloadItem of payloadArray) {
          // make a copy of the object so it can be modified
          var learner = Object.assign({}, payloadItem);

          // add a 'key/value' properties so atriumContents plays nicely with
          // javascript .map()
          learner.key = `${key++}`;

          learners.push(learner);
        }
      }

      log.debug(
        `onLearnerList '${this.connectionId}': refreshing '${JSON.stringify(
          learners
        )}'`
      );

      // re-initialize property manager with array of Participant objects
      this.slotManager = new SlotManager(this.MAX_TURKEES);

      for (const learner of learners) {
        // add learner to chat component
        this.assignLearnerToChat(learner);
      }

      var slotInfos = this.slotManager.RemoteSlots();

      this.setState({ slotInfos: slotInfos });
    } catch (error) {
      LogException(`onLearnerList '${this.connectionId}'`, error);
    }
  }

  calculateChatCellWidth(localSlots) {
    let totalToShow = 0;
    for (let index = 0; index < localSlots.length; index++) {
      if (localSlots[index].show) {
        totalToShow++;
      }
    }

    if (!totalToShow) {
      return { width: "100%" };
    }

    if (totalToShow < this.numColumns) {
      return { width: `${Math.floor(100 / totalToShow)}%` };
    }

    return { width: "25%" };
  }

  generateChatGrid() {
    const { remoteSlots, localSlots, localInfo, jumpNodes } = this.state;

    let foundConnectedChat = false;

    let chatRows = [];

    log.debug(`generateChatGrid '${this.connectionId}':`);

    // calculate chat cell width
    let chatCellWidthStyle = this.calculateChatCellWidth(localSlots);

    // only do grid work if localInfo is not empty
    if (!localInfo.isEmpty()) {
      for (var rowIndex = 0; rowIndex < this.NUM_ROWS; rowIndex++) {
        let columns = [];
        for (
          let columnIndex = 0;
          columnIndex < this.numColumns;
          columnIndex++
        ) {
          let index = rowIndex * this.numColumns + columnIndex;

          // make a copy of the current moderator so we can
          // assigned learner-specific information (allowing
          // individual state for each chat grid item)
          const remoteSlot = remoteSlots[index];
          const localSlot = localSlots[index];

          if (localSlot.show) {
            foundConnectedChat = true;
          }

          log.debug(
            `   ${rowIndex}:${columnIndex}: '${remoteSlot.commandChannel}' show? '${localSlot.show}'`
          );

          var session = {
            contextId: null,
          };

          columns.push(
            <ChatCell
              name="chatcell"
              session={session}
              key={index}
              index={index}
              style={chatCellWidthStyle}
              isModerator={this.props.isModerator}
              connection={this.connection}
              localInfo={localSlot}
              senderInfo={remoteSlot}
              playerProps={this.props.props}
              onPopupMessage={this.onPopupMessage}
            />
          );
        }

        chatRows.push(<TableRow key={rowIndex}>{columns}</TableRow>);
      }
    }

    if (foundConnectedChat) {
      return (
        <Table className={localCss.mainTableLayout}>
          <TableBody>{chatRows}</TableBody>
        </Table>
      );
    }
  }

  onAtriumAssignClicked(selectedLearner) {
    let { localInfo } = this.state;
    log.debug(
      `onAtriumAssignClicked '${
        this.connectionId
      }': learner = '${JSON.stringify(selectedLearner, null, 2)}' `
    );

    // re-assign a slot to put the participant in
    // and send that to the server
    const slotIndex = this.slotManager.getSlotIndex(selectedLearner);
    selectedLearner.slotIndex = slotIndex;

    log.debug(
      `onAtriumAssignClicked '${this.connectionId}': assigned to slot '${slotIndex}' `
    );

    // signal server with assignment of turkee to this room
    this.connection.send(
      constants.SIGNALCMD_ASSIGNTURKEE,
      selectedLearner,
      localInfo.roomName
    );
  }

  onAtriumUpdate(currentAtrium) {
    if (this.props.onScreenPopup) {
      this.props.onScreenPopup({ message: "Atrium Updated" });
    }
  }

  onPopupMessage(message) {
    if (this.props.onScreenPopup) {
      this.props.onScreenPopup({ message: message });
    }
  }

  onCloseClicked(event) {
    const { localInfo } = this.state;

    log.debug(
      `onCloseClicked '${this.connectionId}': room = '${localInfo.roomName}'`
    );

    // signal server to close out this room
    this.connection.send(constants.SIGNALCMD_ROOMCLOSE, localInfo.roomName);
  }

  render() {
    const { showChatGrid, localInfo, sessionId, userName } = this.state;

    let common = (
      <Grid container>
        <Grid item xs={6}>
          <Atrium
            userName={userName}
            connection={this.connection}
            onAtriumAssignClicked={this.onAtriumAssignClicked}
            onAtriumUpdate={this.onAtriumUpdate}
          />
        </Grid>
        <Grid item xs={2}>
          &nbsp;
        </Grid>
        <Grid item xs={4}>
          <RememberedLearners
            userName={userName}
            connection={this.connection}
          />
        </Grid>
      </Grid>
    );

    if (!showChatGrid) {
      return (
        <Grid container>
          <div className={localCss.emptyGridLayout}>
            <div className={localCss.emptyGridLabel}>
              Waiting for Participant
            </div>
          </div>
          <TurkerChatStatusBar
            isModerator={true}
            sessionId={sessionId}
            connection={this.connection}
            localInfo={localInfo}
          />

          <Grid container>
            <div>
              <br />
            </div>
          </Grid>

          {common}
        </Grid>
      );
    }

    let chatRows = this.generateChatGrid();
    return (
      <Grid container>
        {chatRows}
        <TurkerChatStatusBar
          isModerator={true}
          sessionId={sessionId}
          connection={this.connection}
          localInfo={localInfo}
        />

        <Grid container>
          <div>
            <br />
          </div>
        </Grid>

        {common}
      </Grid>
    );
  }
  catch(error) {
    LogException("render", error);
    return <b>TurkerStatusBar: {error.message}</b>;
  }
}

export default withStyles(styles)(TurkerChatCellGrid);
