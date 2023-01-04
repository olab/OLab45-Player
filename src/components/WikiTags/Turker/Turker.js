// @flow
import * as React from 'react';
import {
  Button, Grid, FormLabel, Table,
  TableBody, MenuItem, Select, TableRow
} from '@material-ui/core';
import log from 'loglevel';
import { withStyles } from '@material-ui/core/styles';

import Turker from '../../../services/turker';
import styles from '../styles.module.css';
import SlotManager from '../ChatCell/SlotManager';
import TurkerChatStatusBar from './TurkerChatStatusBar';
import TurkerChatCellGrid from './TurkerChatCellGrid';
import Participant from '../../../helpers/participant';
import SlotInfo from '../../../helpers/SlotInfo';
var constants = require('../../../services/constants');
const persistantStorage = require('../../../utils/StateStorage').PersistantStateStorage;

class OlabModeratorTag extends React.Component {

  constructor(props) {

    super(props);

    var atrium = persistantStorage.get(
      'atrium', {
      atriumLearners: [], selectedLearnerUserId: '0'
    });

    this.state = {
      connectionStatus: null,
      maxHeight: 200,
      // selectedLearnerUserId: '0',
      // atriumLearners: [],
      userName: props.props.authActions.getUserName(),
      width: '100%',
      localInfo: new SlotInfo(),
      sessionId: '',
      ...atrium
    };

    this.onAtriumUpdate = this.onAtriumUpdate.bind(this);
    this.onRoomAssigned = this.onRoomAssigned.bind(this);

    this.onTurkeeSelected = this.onAtriumLearnerSelected.bind(this);
    this.onAssignClicked = this.onAssignClicked.bind(this);
    this.onCloseClicked = this.onCloseClicked.bind(this);

    this.onConnectionChanged = this.onConnectionChanged.bind(this);
    this.onAtriumLearnerSelected = this.onAtriumLearnerSelected.bind(this);

    this.turker = new Turker(this);
    this.turker.connect(this.state.userName);
    this.connection = this.turker.connection;
    this.connectionId = '';

    var self = this;
    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { self.onCommandCallback(payload) });
  }

  onCommandCallback(payload) {

    let { localInfo } = this.state;

    try {

      log.debug(`'${localInfo.connectionId}' onTurkerCommandCallback: ${payload.command}`);

      if (payload.command === constants.SIGNALCMD_ROOMASSIGNED) {
        this.onRoomAssigned(payload.data);
      }

      else if (payload.command === constants.SIGNALCMD_ATRIUMUPDATE) {
        this.onAtriumUpdate(payload.data);
      }

      else {
        log.debug(`'${localInfo.connectionId}' onTurkerCommandCallback unknown command: '${payload.command}'`);
      }

    } catch (error) {
      log.error(`'${localInfo.connectionId}' onTurkerCommandCallback exception: ${error.message}`);
    }

  }

  onRoomAssigned(payload) {

    let {
      userName,
      localInfo
    } = this.state;

    try {

      // ignore any messages not to me
      if (userName !== payload.local.userId) {
        return false;
      }

      let moderator = new Participant(payload.local);
      moderator.isModerator = true;

      localInfo = new SlotInfo();
      localInfo.assigned = true;

      localInfo.SetParticipant(moderator);
      localInfo.connectionId = localInfo.connectionId.slice(-3);

      this.setState({
        localInfo: localInfo
      });

      log.debug(`'${localInfo.connectionId}' onRoomAssigned localInfo = ${JSON.stringify(localInfo, null, 2)}]`);

      persistantStorage.save('connectionInfo', localInfo);

    } catch (error) {
      log.error(`'${localInfo.connectionId}' onRoomAssigned exception: ${error.message}`);
    }

  }

  // handle atrium contents updated
  onAtriumUpdate(payloadArray) {

    let { localInfo } = this.state;

    try {

      let atriumLearners = [];
      let {
        localInfo
      } = this.state;

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

        log.debug(`'${localInfo.connectionId}' onAtriumUpdate: refreshing: '${JSON.stringify(atriumLearners)}'`);

        this.setState({
          atriumLearners: atriumLearners,
          selectedLearnerUserId: '0'
        });

        this.updateAtriumState();

      }

    } catch (error) {
      log.error(`'${localInfo.connectionId}' onAtriumUpdate exception: ${error.message}`);
    }

  }

  onAtriumLearnerSelected(event) {

    let { localInfo } = this.state;

    try {

      let {
        selectedLearnerUserId,
        atriumLearners,
        localInfo
      } = this.state;

      // test for valid turkee selected from available list
      if (event.target.value !== '0') {

        log.debug(`'${localInfo.connectionId}' onAtriumLearnerSelected: ${event.target.value}`);

        // find learner in atrium list
        for (let item of this.state.atriumLearners) {
          if (item.userId === event.target.value) {
            selectedLearnerUserId = item.userId;
          }
        }

        this.setState({ selectedLearnerUserId: selectedLearnerUserId });

        this.updateAtriumState();
      }

    } catch (error) {
      log.error(`'${localInfo.connectionId}' onAtriumLearnerSelected exception: ${error.message}`);
    }

  }

  onCloseClicked(event) {

    const { localInfo } = this.state;

    log.debug(`'${localInfo.connectionId}' onCloseClicked: room = '${localInfo.roomName}'`);

    // signal server to close out this room
    this.connection.send(constants.SIGNALCMD_ROOMCLOSE, localInfo.roomName);
  }

  onAssignClicked(event) {

    let { localInfo } = this.state;

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

      let { localInfo } = this.state;

      log.debug(`'${localInfo.connectionId}' onAssignClicked: learner = '${JSON.stringify(selectedLearner, null, 2)}' `);

      // signal server with assignment of turkee to this room
      this.connection.send(constants.SIGNALCMD_ASSIGNTURKEE, selectedLearner, localInfo.roomName);

      // save atrium state to local storage
      this.updateAtriumState();

    } catch (error) {
      log.error(`'${localInfo.connectionId}' onAssignClicked exception: ${error.message}`);
    }

  }

  updateAtriumState() {

    let {
      selectedLearnerUserId,
      atriumLearners,
      localInfo
    } = this.state;

    try {

      const state = {
        roomName: localInfo.roomName,
        selectedLearnerUserId,
        atriumLearners
      };

      persistantStorage.save('atrium', state);

    } catch (error) {
      log.error(`'${localInfo.connectionId}' updateAtriumState exception: ${error.message}`);
    }

  }

  // applies changes to connection status
  onConnectionChanged(connectionInfo) {

    try {

      const { localInfo } = this.state;
      localInfo.connectionId = connectionInfo.connectionId;

      this.setState({
        connectionStatus: connectionInfo,
        localInfo: localInfo
      });

    } catch (error) {
      log.error(`'${connectionInfo.connectionId}' onConnectionChanged exception: ${error.message}`);
    }

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

    log.debug(`'${localInfo.connectionId}' OlabTurkerTag render '${userName}'`);

    try {

      // prevent anything interesting happening
      // until we are connected
      if (!connectionStatus || !localInfo?.assigned) {
        return (<></>);
      }

      return (
        <>
          <Grid container item xs={12}>

            <Grid container>
              <TurkerChatCellGrid
                isModerator={true}
                connection={this.connection}
                roomName={localInfo.roomName}
                localInfo={localInfo}
              />

              <TurkerChatStatusBar
                isModerator={true}
                sessionId={sessionId}
                connection={this.turker.connection}
                localInfo={localInfo} />

            </Grid>

            <Grid container>
              <div><br /></div>
            </Grid>

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
              <Grid container item xs={4}>
                &nbsp;
              </Grid>
              <Grid container justifyContent="flex-end" item xs={4}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  style={{ verticalAlign: 'center', height: '30px' }}
                  onClick={this.onCloseClicked}
                >
                  &nbsp;Close Room&nbsp;
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <br />
        </>
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
