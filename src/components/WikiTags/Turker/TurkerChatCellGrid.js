// @flow
import * as React from 'react';
import {
  Table,
  TableBody,
  TableRow
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import log from 'loglevel';
import styles from '../styles.module.css';

import SlotManager from '../ChatCell/SlotManager';
import ChatCell from '../ChatCell/ChatCell'
var constants = require('../../../services/constants');

class TurkerChatCellGrid extends React.Component {

  constructor(props) {
    super(props);

    // this defines the max number of turkees
    // for the turker
    this.MAX_TURKEES = 8;
    this.NUM_ROWS = 2;
    this.numColumns = this.MAX_TURKEES / this.NUM_ROWS;

    this.buildSlotManager();
    // initialize property manager with array of Participant objects
    // this.slotManager = new SlotManager(
    // this.MAX_TURKEES,
    // this.props.localInfo);

    this.connection = this.props.connection;
    this.roomName = this.props.roomName;

    this.state = {
      slotInfos: this.slotManager.Slots(),
      localInfo: this.props.localInfo,
      hasAssignedLearner: false
    };

    this.onLearnerAssignmentChanged = this.onLearnerAssignmentChanged.bind(this);

    var self = this;
    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { self.onCommandCallback(payload) });

  }

  // *****
  onCommandCallback(payload) {

    log.debug(`onTurkerChatGridCommandCallback: ${payload.command}`);

    // if (payload.command === constants.SIGNALCMD_ROOMASSIGNED) {
    //   this.onCommandRoomAssigned(payload.data);
    // }

    if (payload.command === constants.SIGNALCMD_LEARNER_ASSIGNED) {
      this.onLearnerAssigned(payload.data);
    }

    else if (payload.command === constants.SIGNALCMD_LEARNER_UNASSIGNED) {
      this.onLearnerUnassigned(payload.data);
    }

    else {
      log.debug(`onTurkerChatGridCommandCallback ignoring command: '${payload.command}'`);
    }

  }

  // learner has been assigned to the room
  onLearnerAssigned(payload) {

    try {

      var slot = this.slotManager.assignLearner(payload);

      slot.assigned = true;
      slot.show = true;

      var chatInfos = this.slotManager.Slots();
      this.setState({
        hasAssignedLearner: true,
        chatInfos: chatInfos
      });

    } catch (error) {
      log.error(`onLearnerAssigned exception: ${error.message}`);
    }
  }

  // learner has disconnected from the topic
  onLearnerUnassigned(payload) {

    try {

      log.debug(`onLearnerUnassigned: connectionId '${payload}'`);

      let {
        chatInfos
      } = this.state;

      // get chat for connection id.  when found, mark the chat
      // as disconnected.
      let chatInfo = this.slotManager.getSlotByConnectionId(payload.connectionId);
      if (chatInfo) {
        chatInfo.assigned = false;
        this.setState({ chatInfos: chatInfos });
      }

    } catch (error) {
      log.error(`onLearnerUnassigned exception: ${error.message}`);
    }
  }

  // signal up connected learner assignments
  onLearnerAssignmentChanged(connectedSlots) {

    log.debug(`onLearnerAssignmentChanged: number of connected slots '${connectedSlots.length}'`);

    if (this.props.onLearnerAssignmentChanged) {
      this.props.onLearnerAssignmentChanged(connectedSlots);
    }
  }

  // handle learner list (for rebuilding
  // chat cells after a disconnect)
  onLearnerList(payloadArray) {

    try {

      let learners = [];

      // save atrium contents if array passed in
      if (Array.isArray(payloadArray) && (payloadArray.length >= 0)) {
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

      log.debug(`onLearnerList: refreshing: '${JSON.stringify(learners)}'`);

      // re-initialize property manager with array of Participant objects
      this.slotManager = new SlotManager(this.MAX_TURKEES);

      for (const learner of learners) {
        // add learner to chat component
        this.assignLearnerToChat(learner);
      }

      var slotInfos = this.slotManager.Slots();

      this.setState({ slotInfos: slotInfos });

    } catch (error) {
      log.error(`onLearnerList exception: ${error.message}`);
    }

  }

  generateChatGrid() {

    const {
      slotInfos,
      localInfo
    } = this.state;

    let foundConnectedChat = false;
    let connectedSlots = [];

    let rows = [];
    for (var rowIndex = 0; rowIndex < this.NUM_ROWS; rowIndex++) {
      let columns = [];
      for (let columnIndex = 0; columnIndex < this.numColumns; columnIndex++) {

        const index = (rowIndex * this.numColumns) + columnIndex;

        // make a copy of the current moderator so we can
        // assigned learner-specific information (allowing 
        // individual state for each chat grid item)
        const slotInfo = slotInfos[index];

        if (slotInfo.show) {
          foundConnectedChat = true;
          connectedSlots.push(slotInfo);
          columns.push(
            <ChatCell
              key={index}
              isModerator={this.props.isModerator}
              connection={this.connection}
              localInfo={slotInfo}
              senderInfo={localInfo}
              playerProps={this.props.props} />
          );
        }
      }

      rows.push(
        <TableRow key={rowIndex}>
          {columns}
        </TableRow>
      );

    }

    this.onLearnerAssignmentChanged(connectedSlots);

    return rows;

  }

  buildSlotManager() {

    // test if already have one, if so
    // then do nothing
    if (this.slotManager) {
      return;
    }

    // test if moderator is connected
    if (this.props.localInfo) {

      var tempInfo = Object.assign({}, this.props.localInfo );
      tempInfo.commandChannel = null;
      tempInfo.assigned = false;
      tempInfo.show = false;

      this.slotManager = new SlotManager(
        this.MAX_TURKEES,
        tempInfo);
    }
  }

  render() {

    const {
      hasAssignedLearner,
    } = this.state;

    const tableLayout = { border: '2px solid black', backgroundColor: '#3333', width: '100%' };
    const emptyGridLayout = { border: '2px solid black', width: '100%', textAlign: 'center' };

    let chatRows = this.generateChatGrid();

    if (hasAssignedLearner && chatRows) {
      return (
        <Table style={tableLayout}>
          <TableBody>
            {chatRows}
          </TableBody>
        </Table>
      );
    }
    else {
      return (
        <div style={emptyGridLayout} >
          <h3>Waiting for learners</h3>
        </div>
      );
    }

  } catch(error) {
    return (
      <b>TurkerStatusBar: {error.message}</b>
    );
  }
}

export default withStyles(styles)(TurkerChatCellGrid);
