// @flow
import * as React from 'react';
import {
  Button, Grid, FormLabel, Table,
  TableBody, MenuItem, Select, TableRow, Snackbar
} from '@material-ui/core';
import { Log, LogInfo, LogError } from '../../../../../utils/Logger';
import log from 'loglevel';
import { withStyles } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';

import Atrium from '../Atrium/Atrium';
import Turker from '../../../../../services/turker';
import styles from '../../../styles.module.css';
import TurkerChatCellGrid from './TurkerChatCellGrid';
import Participant from '../../../../../helpers/participant';
import SlotInfo from '../../../../../helpers/SlotInfo';
const playerState = require('../../../../../utils/PlayerState').PlayerState;
var constants = require('../../../../../services/constants');

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class OlabModeratorTag extends React.Component {

  constructor(props) {

    super(props);

    let atrium = playerState.GetAtrium();

    this.state = {
      connectionStatus: null,
      maxHeight: 200,
      userName: props.props.authActions.getUserName(),
      width: '100%',
      localInfo: new SlotInfo(),
      ...atrium,
      infoOpen: null
    };

    this.handleInfoClose = this.handleInfoClose.bind(this);
    this.onModeratorAssigned = this.onModeratorAssigned.bind(this);
    this.onCloseClicked = this.onCloseClicked.bind(this);
    this.onAtriumAssignClicked = this.onAtriumAssignClicked.bind(this);
    this.onAtriumUpdate = this.onAtriumUpdate.bind(this);

    this.onConnectionChanged = this.onConnectionChanged.bind(this);

    this.turker = new Turker(this);
    this.turker.connect(this.state.userName);
    this.connection = this.turker.connection;
    this.connectionId = '';

    var turkerSelf = this;
    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { turkerSelf.onCommand(payload) });
  }

  onCommand(payload) {

    let { localInfo } = this.state;

    try {

      if (payload.command === constants.SIGNALCMD_TURKER_ASSIGNED) {
        log.debug(`'${localInfo.connectionId}' onCommand: ${payload.command}`);
        this.onModeratorAssigned(payload.data);
      }

    } catch (error) {
      LogError(`'${localInfo.connectionId}' onTurkerCommandCallback exception: ${error.message}`);
    }

  }

  onModeratorAssigned(payload) {

    let {
      userName,
      localInfo
    } = this.state;

    try {

      // ignore any messages not to me
      if (userName !== payload.remote.userId) {
        return false;
      }

      let moderator = new Participant(payload.remote);
      moderator.isModerator = true;

      localInfo = new SlotInfo();
      localInfo.assigned = true;

      localInfo.SetParticipant(moderator);
      localInfo.connectionId = localInfo.connectionId.slice(-3);

      this.setState({
        localInfo: localInfo,
        mapNodes: payload.mapNodes
      });

      log.debug(`'${localInfo.connectionId}' onModeratorAssigned localInfo = ${JSON.stringify(payload, null, 2)}]`);

      playerState.SetConnectionInfo(null, localInfo);

    } catch (error) {
      LogError(`'${localInfo.connectionId}' onModeratorAssigned exception: ${error.message}`);
    }

  }

  onCloseClicked(event) {

    const { localInfo } = this.state;

    log.debug(`'${localInfo.connectionId}' onCloseClicked: room = '${localInfo.roomName}'`);

    // signal server to close out this room
    this.connection.send(constants.SIGNALCMD_ROOMCLOSE, localInfo.roomName);
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
      LogError(`'${connectionInfo.connectionId}' onConnectionChanged exception: ${error.message}`);
    }

  }

  handleInfoClose(event, reason) {

    if (reason === 'clickaway') {
      return;
    }
    this.setState({ infoOpen: false });

  };

  onAtriumAssignClicked(selectedLearner) {

    let { localInfo } = this.state;
    log.debug(`'${localInfo.connectionId}' onAssignClicked: learner = '${JSON.stringify(selectedLearner, null, 2)}' `);

    // signal server with assignment of turkee to this room
    this.connection.send(
      constants.SIGNALCMD_ASSIGNTURKEE,
      selectedLearner,
      localInfo.roomName);

  }

  onAtriumUpdate(currentAtrium) {
    this.setState({
      infoOpen: true,
      infoMessage: 'Atrium Updated'
    });
  }

  render() {

    const {
      userName,
      connectionStatus,
      localInfo,
      sessionId,
      infoOpen,
      infoMessage,
      mapNodes
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

            <TurkerChatCellGrid
              isModerator={true}
              connection={this.connection}
              roomName={localInfo.roomName}
              localInfo={localInfo}
              mapNodes={mapNodes}
            />

            <Grid container>
              <div><br /></div>
            </Grid>

            <Grid container>
              <Grid container item xs={6}>
                <Atrium
                  userName={userName}
                  connection={this.turker.connection}
                  onAtriumAssignClicked={this.onAtriumAssignClicked}
                  onAtriumUpdate={this.onAtriumUpdate}
                />
              </Grid>
              <Grid container item xs={2}>
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
          {(infoOpen === true) && (
            <Snackbar open={infoOpen} autoHideDuration={3000} onClose={this.handleInfoClose}>
              <Alert onClose={this.handleInfoClose} severity="info">
                {infoMessage}
              </Alert>
            </Snackbar>
          )}
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
