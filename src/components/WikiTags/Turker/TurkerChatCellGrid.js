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

    // initialize property manager with array of Participant objects
    this.propManager = new SlotManager(this.MAX_TURKEES);

    this.connection = this.props.connection;
    this.roomName = this.props.roomName;

    this.state = {
      slotInfos: this.propManager.Slots(),
      moderatorInfo: this.props.moderatorInfo,
      hasAssignedLearner: false
    };

    this.onLearnerAssignmentChanged = this.onLearnerAssignmentChanged.bind(this);

    var self = this;
    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { self.onCommandCallback(payload) });

  }

  // *****
  onCommandCallback(payload) {

    log.debug(`onChatGridCommandCallback: ${payload.command}, ${JSON.stringify(payload.data, null, 2)}`);

    if (payload.command === constants.SIGNALCMD_ROOMASSIGNED) {
      this.onCommandRoomAssigned(payload.data);
    }

    else if (payload.command === constants.SIGNALCMD_LEARNER_ASSIGNED) {
      this.onCommandLearnerAssigned(payload.data);
    }

    else {
      log.debug(`onChatGridCommandCallback ignoring command: '${payload.command}'`);
    }

  }

  onCommandRoomAssigned(payload) {

    try {

      // ignore any messages to me directly
      if (this.props.moderatorInfo.userId === payload.userId) {
        return false;
      }

      this.propManager.assignLearner(payload);
      var slotInfos = this.propManager.Slots();

      this.setState({
        slotInfos: slotInfos
      });

    } catch (error) {
      log.error(`onCommandRoomAssigned exception: ${error.message}`);
    }

  }

  // learner has been assigned to the room
  onCommandLearnerAssigned(payload) {

    try {

      var slot = this.propManager.assignLearner(payload);
      slot.assigned = true;
      slot.show = true;

      var chatInfos = this.propManager.Slots();
      this.setState({
        hasAssignedLearner: true, 
        chatInfos: chatInfos 
      });

    } catch (error) {
      log.error(`onLearnerAssigned exception: ${error.message}`);
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
      this.propManager = new SlotManager(this.MAX_TURKEES);

      for (const learner of learners) {
        // add learner to chat component
        this.assignLearnerToChat(learner);
      }

      var slotInfos = this.propManager.Slots();

      this.setState({ slotInfos: slotInfos });

    } catch (error) {
      log.error(`onLearnerList exception: ${error.message}`);
    }

  }

  generateChatGrid() {

    const {
      slotInfos,
      localInfo,
      moderatorInfo
    } = this.state;

    let foundConnectedChat = false;
    let connectedSlots = [];

    let rows = [];
    for (var rowIndex = 0; rowIndex < this.NUM_ROWS; rowIndex++) {
      let columns = [];
      for (let columnIndex = 0; columnIndex < this.numColumns; columnIndex++) {

        const slotInfo = slotInfos[(rowIndex * this.numColumns) + columnIndex];
        if (slotInfo.show) {
          foundConnectedChat = true;
          connectedSlots.push(slotInfo);
          columns.push(
            <ChatCell
              isModerator={this.props.isModerator}
              connection={this.connection}
              localInfo={moderatorInfo}
              remoteInfo={slotInfo}
              playerProps={this.props.props} />
          );
        }
      }

      rows.push(
        <TableRow>
          {columns}
        </TableRow>
      );

    }

    this.onLearnerAssignmentChanged(connectedSlots);

    return rows;

  }

  render() {

    const {
      hasAssignedLearner
    } = this.state;

    const tableLayout = { border: '2px solid black', backgroundColor: '#3333', width: '100%' };
    const emptyGridLayout = { border: '2px solid black', width: '100%', textAlign: 'center' };

    let chatRows = this.generateChatGrid();

    if (hasAssignedLearner) {
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
