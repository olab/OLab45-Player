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

    this.state = {
      connectionStatus: '',
      maxHeight: 200,
      selectedLearnerUserId: '0',
      atriumLearners: [],
      userName: props.props.authActions.getUserName(),
      width: '100%',
      localInfo: null,
      sessionId: ''
    };

    this.onAtriumUpdate = this.onAtriumUpdate.bind(this);
    this.onRoomAssigned = this.onRoomAssigned.bind(this);

    this.onTurkeeSelected = this.onAtriumLearnerSelected.bind(this);
    this.onAssignClicked = this.onAssignClicked.bind(this);
    this.onConnectionChanged = this.onConnectionChanged.bind(this);
    this.onAtriumLearnerSelected = this.onAtriumLearnerSelected.bind(this);

    this.turker = new Turker(this);
    this.turker.connect(this.state.userName);
    this.connection = this.turker.connection;

    var self = this;
    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { self.onCommandCallback(payload) });
  }

  onCommandCallback(payload) {

    try {

      log.debug(`onTurkerCommandCallback: ${payload.command}`);

      if (payload.command === constants.SIGNALCMD_ROOMASSIGNED) {
        this.onRoomAssigned(payload.data);
      }

      else if (payload.command === constants.SIGNALCMD_LEARNER_ASSIGNED) {
        this.onLearnerAssigned(payload.data);
      }

      else if (payload.command === constants.SIGNALCMD_ATRIUMUPDATE) {
        this.onAtriumUpdate(payload.data);
      }

      else if (payload.command === constants.SIGNALCMD_LEARNER_LIST) {
        this.onLearnerList(payload.data);
      }

      else {
        log.debug(`onTurkerCommandCallback unknown command: '${payload.command}'`);
      }

    } catch (error) {
      log.error(`onTurkerCommandCallback exception: ${error.message}`);
    }

  }

  onRoomAssigned(payload) {

    try {

      let {
        userName,
        localInfo
      } = this.state;

      // ignore any messages not to me
      if (userName !== payload.local.userId) {
        return false;
      }

      let moderator = new Participant(payload.local);
      moderator.isModerator = true;

      localInfo = new SlotInfo();
      localInfo.assigned = true;
      localInfo.show = true;

      localInfo.SetParticipant(moderator);

      this.setState({
        localInfo: localInfo
      });

      log.debug(`onRoomAssigned localInfo = ${JSON.stringify(localInfo, null, 2)}]`);

      persistantStorage.save('connectionInfo', localInfo);

    } catch (error) {
      log.error(`onRoomAssigned exception: ${error.message}`);
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

        log.debug(`onAtriumUpdate: refreshing: '${JSON.stringify(atriumLearners)}'`);

        this.setState({
          atriumLearners: atriumLearners,
          selectedLearnerUserId: '0'
        });

      }

    } catch (error) {
      log.error(`onAtriumUpdate exception: ${error.message}`);
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

      let { localInfo } = this.state;

      log.debug(`onAssignClicked: learner = '${JSON.stringify(selectedLearner, null, 2)}' `);

      // signal server with assignment of turkee to this room
      this.connection.send(constants.SIGNALCMD_ASSIGNTURKEE, selectedLearner, localInfo.roomName);

    } catch (error) {
      log.error(`onAssignClicked exception: ${error.message}`);
    }

  }

  // learner has been assigned to the room so 
  // we can 'open up' the chat grid
  onLearnerAssigned(payload) {

    try {
      this.setState({ foundConnectedChat: true });
    } catch (error) {
      log.error(`onLearnerAssigned exception: ${error.message}`);
    }
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

  // onRoomRejoined(payload) {

  //   try {

  //     let {
  //       chatInfos,
  //     } = this.state;

  //     let learner = new Participant(payload);
  //     log.debug(`onRoomRejoined: setting room: '${learner.toString()}'`);

  //     // get chat for learner.  when found, mark the chat
  //     // as (re)connected).
  //     let chatInfo = this.propManager.getSlotByUserId(learner.userId);
  //     if (chatInfo) {
  //       chatInfo.connected = true;
  //       chatInfos = this.propManager.Slots();
  //       this.setState({ chatInfos: chatInfos });
  //     }

  //   } catch (error) {
  //     log.error(`onRoomRejoined exception: ${error.message}`);
  //   }

  // }

  // assignLearnerToChat(learner) {

  //   try {

  //     let {
  //       chatInfos,
  //     } = this.state;

  //     var slot = this.propManager.assignLearner(learner);
  //     chatInfos = this.propManager.Slots();

  //     this.setState({ chatInfos: chatInfos });

  //     return slot;

  //   } catch (error) {
  //     log.error(`assignLearnerToChat exception: ${error.message}`);
  //   }
  // }

  // handle learner list (for rebuilding
  // chat cells after a disconnect)
  // onLearnerList(payloadArray) {

  //   try {

  //     let learners = [];

  //     // save atrium contents if array passed in
  //     if (Array.isArray(payloadArray) && (payloadArray.length >= 0)) {
  //       let key = 1;
  //       for (const payloadItem of payloadArray) {

  //         // make a copy of the object so it can be modified  
  //         var learner = Object.assign({}, payloadItem);

  //         // add a 'key/value' properties so atriumContents plays nicely with
  //         // javascript .map()
  //         learner.key = `${key++}`;

  //         learners.push(learner);
  //       }
  //     }

  //     log.debug(`onLearnerList: refreshing: '${JSON.stringify(learners)}'`);

  //     for (const learner of learners) {
  //       // add learner to chat component
  //       this.assignLearnerToChat(learner);
  //     }

  //   } catch (error) {
  //     log.error(`onLearnerList exception: ${error.message}`);
  //   }

  // }

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

    const tableLayout = { border: '2px solid black', backgroundColor: '#3333', width: '100%' };
    const emptyGridLayout = { border: '2px solid black', width: '100%', textAlign: 'center' };

    try {
      return (
        <>
          <Grid container item xs={12}>

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
