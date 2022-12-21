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

import SlotManager from './SlotManager'
import TurkerChatCell from './TurkerChatCell'
var constants = require('../../../services/constants');

class TurkerChatGrid extends React.Component {

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
      moderatorInfo: this.props.moderatorInfo
    };

    this.onLearnerAssignmentChanged = this.onLearnerAssignmentChanged.bind(this);

    var self = this;
    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { self.onChatGridCommandCallback(payload) });

  }

  // *****
  onChatGridCommandCallback(payload) {

    log.debug(`onChatGridCommandCallback: ${payload.command}, ${JSON.stringify(payload.data, null, 2)}`);

    if (payload.command === constants.SIGNALCMD_ROOMASSIGNED) {
      this.onCommandRoomAssigned(payload.data);
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
      localInfo
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
            <TurkerChatCell
              connection={this.connection}
              moderatorInfo={localInfo}
              chatInfo={slotInfo}
              playerProps={this.props.props}
              learnerInfo={slotInfo} />
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
    } = this.state;

    const tableLayout = { border: '2px solid black', backgroundColor: '#3333', width: '100%' };
    let chatRows = this.generateChatGrid();

    return (
      <Table style={tableLayout}>
        <TableBody>
          {chatRows}
        </TableBody>
      </Table>
    );
  } catch(error) {
    return (
      <b>TurkerStatusBar: {error.message}</b>
    );
  }
}

export default withStyles(styles)(TurkerChatGrid);
