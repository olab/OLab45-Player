// @flow
import * as React from 'react';
import {
  Button, Grid, FormLabel, Table, TableBody, MenuItem,
  TableCell, Select,
  TableRow
} from '@material-ui/core';
import log from 'loglevel';
import { withStyles } from '@material-ui/core/styles';
import { HubConnectionState } from '@microsoft/signalr';

import Chat from '../../Chat/Chat'
import Turker from '../../../services/turker';
import styles from '../styles.module.css';
import PropManager from './PropManager'
import TurkerChatStatusBar from './TurkerChatStatusBar';
import TurkeeChatStatusBar from './TurkeeChatStatusBar';
import Participant from '../../../helpers/participant';
const persistantStorage = require('../../../utils/StateStorage').PersistantStateStorage;

class OlabModeratorTag extends React.Component {

  constructor(props) {

    super(props);

    // this defines the max number of turkees
    // for the turker
    this.MAX_TURKEES = 8;
    this.NUM_ROWS = 2;
    this.numColumns = this.MAX_TURKEES / this.NUM_ROWS;

    // initialize property manager with array of Participant objects
    this.propManager = new PropManager(this.MAX_TURKEES);

    this.state = {
      chatInfos: this.propManager.Slots(),
      connectionStatus: '',
      maxHeight: 200,
      selectedLearnerUserId: '0',
      atriumLearners: [],
      userName: props.props.authActions.getUserName(),
      width: '100%',
      localInfo: { Name: null, ConnectionId: null, RoomName: null },
      sessionId: ''
    };

    this.onAtriumUpdate = this.onAtriumUpdate.bind(this);
    this.onTurkeeSelected = this.onAtriumLearnerSelected.bind(this);
    this.onAssignClicked = this.onAssignClicked.bind(this);
    this.onRoomAssigned = this.onRoomAssigned.bind(this);
    this.onConnectionChanged = this.onConnectionChanged.bind(this);
    this.onAtriumLearnerSelected = this.onAtriumLearnerSelected.bind(this);
    this.assignTurkeeToChat = this.assignLearnerToChat.bind(this);

    this.turker = new Turker(this);
    this.turker.connect(this.state.userName);

  }

  // applies changes to connection status
  onConnectionChanged(connectionData) {

    log.debug(`onConnectionChanged: ${connectionData.connection._connectionState}, id: ${connectionData.connection.connectionId}`);

    try {

      let {
        localInfo
      } = this.state;

      localInfo.ConnectionId = connectionData.connection.connectionId;
      localInfo.Name = connectionData.Name;

      this.setState({
        localInfo: localInfo,
        connectionStatus: connectionData.connection._connectionState
      });

    } catch (error) {
      log.error(`onConnectionChanged exception: ${error.message}`);
    }

  }

  onRoomUnassigned(payload) {

    try {

      log.debug(`onRoomUnassigned: connectionId '${payload}'`);

      let {
        chatInfos
      } = this.state;

      // loop thru all the chats and look for a matching
      // connection id.  when found mark the chat
      // as disconnected.
      for (const chatInfo of chatInfos) {
        if ( chatInfo.connectionId === payload ) {
          log.debug(`found chat to disconnect for user '${chatInfo.userId}'`);
          chatInfo.connected = false;
        }
      }

      this.setState({
        chatInfos: chatInfos
      });

    } catch (error) {
      log.error(`onRoomUnassigned exception: ${error.message}`);      
    }
  }
  
  onRoomAssigned(payload) {

    try {

      let moderator = new Participant(payload);
      log.debug(`onRoomAssigned: setting room: '${moderator.toString()}'`);

      let connectionInfo = persistantStorage.get('connectionInfo');
      if (connectionInfo == null) {
        connectionInfo = moderator;
        persistantStorage.save('connectionInfo', connectionInfo);
      }

      this.setState({
        localInfo: connectionInfo
      });

    } catch (error) {
      log.error(`onRoomAssigned exception: ${error.message}`);
    }

  }

  onAtriumLearnerSelected(event) {

    try {

      let {
        selectedLearnerUserId
      } = this.state;

      // test for valid turkee selected from available list
      if (event.target.value !== '0') {

        log.debug(`onAtriumLearnerSelected: ${event.target.value}`);

        // find learner in atrium list
        for (let item of this.state.atriumLearners) {
          if (item.userId === event.target.value) {
            selectedLearnerUserId = item.userId;
          }
        }

        this.setState({ selectedLearnerUserId: selectedLearnerUserId });
      }

    } catch (error) {
      log.error(`onAtriumLearnerSelected exception: ${error.message}`);
    }

  }

  onAssignClicked(event) {

    try {

      const { selectedLearnerUserId } = this.state;
      let selectedLearner = null;

      // get unassigned atrium learner from list
      for (let item of this.state.atriumLearners) {
        if (item.userId === selectedLearnerUserId) {
          selectedLearner = item;
        }
      }

      if (!selectedLearner) {
        throw new Error(`Unable to find unassigned learner ${selectedLearnerUserId}`);
      }

      // add turkee to chat component
      const slotInfo = this.assignLearnerToChat(selectedLearner);

      let {
        localInfo
      } = this.state;

      // signal server with assignment of turkee to turker
      this.turker.onAssignLearner(selectedLearner, localInfo.roomName);

    } catch (error) {
      log.error(`onAssignClicked exception: ${error.message}`);
    }

  }

  assignLearnerToChat(learner) {

    try {

      let {
        chatInfos,
      } = this.state;

      learner = this.propManager.assignLearner(learner);
      chatInfos = this.propManager.Slots();

      this.setState({ chatInfos: chatInfos });

      return learner;

    } catch (error) {
      log.error(`assignLearnerToChat exception: ${error.message}`);
    }
  }

  // handle atrium contents updated
  onAtriumUpdate(payloadArray) {

    try {

      let atriumLearners = [];

      // save atrium contents if array passed in
      if (Array.isArray(payloadArray) && (payloadArray.length >= 0)) {
        let key = 1;
        for (const payloadItem of payloadArray) {

          // make a copy of the object so it can be modified  
          var learner = Object.assign({}, payloadItem);

          // add a 'key/value' properties so atriumContents plays nicely with
          // javascript .map()
          learner.key = `${key++}`;

          atriumLearners.push(learner);
        }
      }

      log.debug(`onAtriumUpdate: refreshing: '${JSON.stringify(atriumLearners)}'`);

      this.setState({
        atriumLearners: atriumLearners,
        selectedLearnerUserId: '0'
      });

    } catch (error) {
      log.error(`onAtriumUpdate exception: ${error.message}`);
    }

  }

  generateChatGrid() {

    const {
      chatInfos,
      localInfo
    } = this.state;

    const cellStyling = { padding: 7 }
    let foundConnectedChat = false;

    let rows = [];
    for (var rowIndex = 0; rowIndex < this.NUM_ROWS; rowIndex++) {
      let columns = [];
      for (let columnIndex = 0; columnIndex < this.numColumns; columnIndex++) {

        const chatInfo = chatInfos[(rowIndex * this.numColumns) + columnIndex];
        if (chatInfo.show) {
          foundConnectedChat = true;
          columns.push(
            <TableCell style={cellStyling}>
              <Chat
                connection={this.turker.connection}
                moderatorInfo={localInfo}
                learnerInfo={chatInfo}
                playerProps={this.props.props} />
              <TurkeeChatStatusBar
                connection={this.turker.connection}
                learnerInfo={chatInfo} />
            </TableCell>
          );
        }
      }

      rows.push(
        <TableRow>
          {columns}
        </TableRow>
      );

    }

    return { rows, foundConnectedChat };

  }

  render() {

    const {
      atriumLearners,
      selectedLearnerUserId,
      userName,
      connectionStatus,
      localInfo,
      sessionId,
    } = this.state;

    log.debug(`OlabTurkerTag render '${userName}'`);

    const tableLayout = { border: '2px solid black', backgroundColor: '#3333' };
    const emptyTableLayout = { border: '2px solid black' };
    let { rows: chatRows, foundConnectedChat } = this.generateChatGrid();

    try {
      return (
        <Grid container item xs={12}>

          {foundConnectedChat &&
            <Table style={tableLayout}>
              <TableBody>
                {chatRows}
              </TableBody>
            </Table>
          }

          {!foundConnectedChat &&
            <Table style={emptyTableLayout} >
              <TableBody>
                <center><h3>Waiting for learners</h3></center>
              </TableBody>
            </Table>
          }

          <TurkerChatStatusBar
            sessionId={sessionId}
            connection={this.turker.connection}
            connectionStatus={connectionStatus}
            localInfo={localInfo} />

          &nbsp;

          <Grid container>
            <Grid container item xs={3}>
              <FormLabel>Unassigned Learners ({atriumLearners.length} waiting)</FormLabel>
              <Select
                value={selectedLearnerUserId}
                onChange={this.onAtriumLearnerSelected}
                style={{ width: '100%' }}
              >
                <MenuItem key="0" value="0">
                  <em>--Select--</em>
                </MenuItem>
                {atriumLearners.map((item) => (
                  <MenuItem
                    key={item.userId}
                    value={item.userId}>
                    {item.nickName}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid container item xs={1}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                style={{ verticalAlign: 'center', height: '30px' }}
                onClick={this.onAssignClicked}
              >
                &nbsp;Assign&nbsp;
              </Button>
            </Grid>
          </Grid>
        </Grid>
      );

    } catch (error) {
      return (
        <>
          <b>[[MODERATOR]] "{error.message}"</b>
        </>
      );
    }
  }

}

export default withStyles(styles)(OlabModeratorTag);
