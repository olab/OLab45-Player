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
const persistantStorage = require('../../../utils/StateStorage').PersistantStateStorage;

class OlabModeratorTag extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      connectionInfos: [],
      connectionStatus: '',
      maxHeight: 200,
      selectedAtriumItem: '0',
      atriumContents: [],
      userName: props.props.authActions.getUserName(),
      width: '100%',
      localInfo: { Name: null, ConnectionId: null, RoomName: null },
      sessionId: '',
    };

    this.onAtriumUpdate = this.onAtriumUpdate.bind(this);
    this.onTurkeeSelected = this.onAtriumLearnerSelected.bind(this);
    this.onAssignClicked = this.onAssignClicked.bind(this);
    this.onRoomAssigned = this.onRoomAssigned.bind(this);
    this.onConnectionChanged = this.onConnectionChanged.bind(this);
    this.onAtriumLearnerSelected = this.onAtriumLearnerSelected.bind(this);
    this.assignTurkeeToChat = this.assignTurkeeToChat.bind(this);  

    this.turker = new Turker(this);
    this.turker.connect(this.state.userName);

    // this defines the max number of turkees
    // for the turker
    this.MAX_TURKEES = 8;
    this.NUM_ROWS = 2;
    this.numColumns = this.MAX_TURKEES / this.NUM_ROWS;

    this.propManager = new PropManager(this.MAX_TURKEES );

    this.state.connectionInfos = this.propManager.getProps();

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

  onAtriumLearnerSelected(event) {

    try {

      // test for valid turkee selected from available list
      if (event.target.value !== '0') {

        log.debug(`onAtriumLearnerSelected: ${event.target.value}`);
        this.setState({ selectedAtriumItem: event.target.value });
      }

    } catch (error) {
      log.error(`onAtriumLearnerSelected exception: ${error.message}`);
    }

  }

  onRoomAssigned(payloadData) {

    try {
      log.debug(`onRoomAssigned: setting room: '${payloadData}'`);

      let {
        localInfo        
      } = this.state;

      localInfo.RoomName = payloadData;

      this.setState({
        localInfo: localInfo
      });

      let connectionInfo = persistantStorage.get('connectionInfo');
      if ( connectionInfo != null ) {
        localInfo.RoomName = connectionInfo.RoomName
      }
      else {
        connectionInfo = {
          RoomName: localInfo.RoomName
        };
      }

      persistantStorage.save('connectionInfo', connectionInfo);
  
    } catch (error) {
      log.error(`onRoomAssigned exception: ${error.message}`);
    }

  }

  onAssignClicked(event) {

    try {

      const { selectedAtriumItem } = this.state;
      let selectedLearnerInfo = null;

      // get unassigned atrium learner from list
      for (let item of this.state.atriumContents) {
        if (item.value === selectedAtriumItem) {
          selectedLearnerInfo = item;
        }
      }

      if (!selectedLearnerInfo) {
        throw new Error(`Unable to find unassigned learner ${selectedAtriumItem}`);
      }

      // add turkee to chat component
      const slotInfo = this.assignTurkeeToChat(selectedLearnerInfo);

      // signal server with assignment of turkee to turker
      this.turker.onAssignLearner(selectedLearnerInfo);

    } catch (error) {
      log.error(`onAssignClicked exception: ${error.message}`);
    }

  }

  assignTurkeeToChat(learner) {

    try {

      let {
        connectionInfos,
        localInfo
      } = this.state;

      const slotInfo = this.propManager.assignLearner(localInfo, learner);
      connectionInfos = this.propManager.getProps();

      this.setState({ connectionInfos: connectionInfos });

      return slotInfo;

    } catch (error) {
      log.error(`assignTurkeeToChat exception: ${error.message}`);
    }
  }

  // handle atrium contents updated
  onAtriumUpdate(payloadArray) {

    try {

      let atriumContents = [];

      // save atrium contents if array passed in
      if (Array.isArray(payloadArray) && (payloadArray.length >= 0)) {
        let key = 1;
        for (const payloadItem of payloadArray) {

          // make a copy of the object so it can be modified  
          var item = Object.assign({}, payloadItem);
          
          // add a 'key/value' properties so atriumContents plays nicely with
          // javascript .map()
          item.key = `${key++}`;
          item.value = item.userId;

          atriumContents.push(item);
        }
      }

      log.debug(`onAtriumUpdate: refreshing: '${JSON.stringify(atriumContents)}'`);

      this.setState({
        atriumContents: atriumContents,
        selectedAtriumItem: '0'
      });

    } catch (error) {
      log.error(`onAtriumUpdate exception: ${error.message}`);
    }

  }

  generateChatGrid() {

    const {
      connectionInfos,
    } = this.state;

    const cellStyling = { padding: 7 }

    let rows = [];
    for (var rowIndex = 0; rowIndex < this.NUM_ROWS; rowIndex++) {
      let columns = [];
      for (let columnIndex = 0; columnIndex < this.numColumns; columnIndex++) {
        const connectionInfo = connectionInfos[(rowIndex * this.numColumns) + columnIndex];
        columns.push(
          <TableCell style={cellStyling}>
            <Chat
              connection={this.turker.connection}
              localInfo={connectionInfo}
              playerProps={this.props.props} />
            <TurkeeChatStatusBar
              connection={this.turker.connection}
              localInfo={connectionInfo} />
          </TableCell>
        );
      }

      rows.push(
        <TableRow>
          {columns}
        </TableRow>
      );
    }

    return rows;

  }

  render() {

    const {
      atriumContents,
      selectedAtriumItem,
      userName,
      connectionStatus,
      localInfo,
      sessionId,
    } = this.state;

    log.debug(`OlabTurkerTag render '${userName}'`);

    const tableLayout = { border: '2px solid black', backgroundColor: '#3333' };
    let chatRows = this.generateChatGrid();

    try {
      return (
        <Grid container item xs={12}>

          <Table style={tableLayout}>
            <TableBody>
              {chatRows}
            </TableBody>
          </Table>

          <TurkerChatStatusBar
            sessionId={sessionId}
            connection={this.turker.connection}
            connectionStatus={connectionStatus}
            localInfo={localInfo} />

          &nbsp;

          <Grid container>
            <Grid container item xs={3}>
              <FormLabel>Unassigned Learners ({atriumContents.length} waiting)</FormLabel>
              <Select
                value={selectedAtriumItem}
                onChange={this.onAtriumLearnerSelected}
                style={{ width: '100%' }}
              >
                <MenuItem key="0" value="0">
                  <em>--Select--</em>
                </MenuItem>
                {atriumContents.map((item) => (
                  <MenuItem
                    key={item.key}
                    value={item.value}>
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
