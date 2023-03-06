// @flow
import * as React from "react";
import {
  Button,
  Grid,
  FormLabel,
  Table,
  TableBody,
  MenuItem,
  Select,
  TableRow,
  Snackbar,
} from "@material-ui/core";
import { Log, LogInfo, LogError } from "../../../../../utils/Logger";
import log from "loglevel";
import { withStyles } from "@material-ui/core/styles";
import MuiAlert from "@material-ui/lab/Alert";

import Turker from "../../../../../services/turker";
import styles from "../../../styles.module.css";
import TurkerChatCellGrid from "./TurkerChatCellGrid";
import Participant from "../../../../../helpers/participant";
import SlotInfo from "../../../../../helpers/SlotInfo";
const playerState = require("../../../../../utils/PlayerState").PlayerState;
var constants = require("../../../../../services/constants");

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class OlabModeratorTag extends React.Component {
  constructor(props) {
    super(props);

    let atrium = playerState.GetAtrium({ roomName: "" });

    const questionSettings = JSON.parse(this.props.props.question.settings);

    // test if we are on a room that's different from what's
    // in local storage.  Reset it if it's different.
    const { roomName: newRoomName } = questionSettings;
    if (!newRoomName) {
      this.onScreenPopup({ message: "No room name defined" });
    }

    const { roomName: previousRoomName } = playerState.GetConnectionInfo(null, {
      roomName: "",
    });

    if (newRoomName != previousRoomName) {
      atrium = {};
      playerState.SetAtrium(null);
      playerState.SetConnectionInfo(null, null);
    }

    this.state = {
      connectionStatus: null,
      maxHeight: 200,
      userName: props.props.authActions.getUserName(),
      width: "100%",
      localInfo: new SlotInfo(),
      ...atrium,
      infoOpen: null,
    };

    this.handleInfoClose = this.handleInfoClose.bind(this);
    this.onModeratorAssigned = this.onModeratorAssigned.bind(this);
    this.onScreenPopup = this.onScreenPopup.bind(this);

    this.onConnectionChanged = this.onConnectionChanged.bind(this);

    this.turker = new Turker(this);
    this.turker.connect(this.state.userName);
    this.connection = this.turker.connection;
    this.connectionId = "";

    var turkerSelf = this;
    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => {
      turkerSelf.onCommand(payload);
    });
  }

  onCommand(payload) {
    let { localInfo } = this.state;

    try {
      if (payload.command === constants.SIGNALCMD_TURKER_ASSIGNED) {
        log.debug(
          `'${localInfo.connectionId}' onCommand: ${JSON.stringify(payload)}`
        );
        this.onModeratorAssigned(payload.data);
      }
    } catch (error) {
      LogError(
        `'${localInfo.connectionId}' onTurkerCommandCallback exception: ${error.message}`
      );
    }
  }

  onModeratorAssigned(payload) {
    let { userName, localInfo } = this.state;

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
        mapNodes: payload.mapNodes,
      });

      log.debug(
        `'${
          localInfo.connectionId
        }' onModeratorAssigned localInfo = ${JSON.stringify(payload, null, 2)}]`
      );

      playerState.SetConnectionInfo(null, localInfo);
    } catch (error) {
      LogError(
        `'${localInfo.connectionId}' onModeratorAssigned exception: ${error.message}`
      );
    }
  }

  // handle atrium contents updated
  onAtriumUpdate(payloadArray) {
    let { localInfo, atriumLearners } = this.state;

    try {
      const previousAtriumCount = atriumLearners.length;

      atriumLearners = [];

      // save atrium contents if array passed in
      if (Array.isArray(payloadArray) && payloadArray.length >= 0) {
        let key = 1;
        for (const payloadItem of payloadArray) {
          // make a copy of the object so it can be modified
          var learner = Object.assign({}, payloadItem);

          // add a 'key/value' properties so atriumContents plays nicely with
          // javascript .map()
          learner.key = `${key++}`;

          atriumLearners.push(learner);
        }

        log.debug(
          `'${
            localInfo.connectionId
          }' onAtriumUpdate: refreshing: '${JSON.stringify(atriumLearners)}'`
        );

        if (previousAtriumCount != atriumLearners.length) {
          this.setState({
            atriumLearners: atriumLearners,
            selectedLearnerUserId: "0",
            infoOpen: true,
            infoMessage: "Atrium Updated",
          });
        } else {
          this.setState({
            atriumLearners: atriumLearners,
            selectedLearnerUserId: "0",
          });
        }

        this.updateAtriumState();
      }
    } catch (error) {
      LogError(
        `'${localInfo.connectionId}' onAtriumUpdate exception: ${error.message}`
      );
    }
  }

  onAtriumLearnerSelected(event) {
    let { localInfo } = this.state;

    try {
      let { selectedLearnerUserId, atriumLearners, localInfo } = this.state;

      // test for valid turkee selected from available list
      if (event.target.value !== "0") {
        log.debug(
          `'${localInfo.connectionId}' onAtriumLearnerSelected: ${event.target.value}`
        );

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
      LogError(
        `'${localInfo.connectionId}' onAtriumLearnerSelected exception: ${error.message}`
      );
    }
  }

  onCloseClicked(event) {
    const { localInfo } = this.state;

    log.debug(
      `'${localInfo.connectionId}' onCloseClicked: room = '${localInfo.roomName}'`
    );

    // signal server to close out this room
    this.connection.send(constants.SIGNALCMD_ROOMCLOSE, localInfo.roomName);
  }

  onAssignClicked(event) {
    let { localInfo } = this.state;

    try {
      const { selectedLearnerUserId } = this.state;
      let selectedLearner = null;

      if (selectedLearnerUserId == undefined || selectedLearnerUserId == "0") {
        return;
      }

      // get unassigned atrium learner from list
      for (let item of this.state.atriumLearners) {
        if (item.userId === selectedLearnerUserId) {
          selectedLearner = item;
        }
      }

      if (!selectedLearner) {
        throw new Error(
          `Unable to find unassigned learner ${selectedLearnerUserId}`
        );
      }

      let { localInfo } = this.state;

      log.debug(
        `'${
          localInfo.connectionId
        }' onAssignClicked: learner = '${JSON.stringify(
          selectedLearner,
          null,
          2
        )}' `
      );

      // signal server with assignment of turkee to this room
      this.connection.send(
        constants.SIGNALCMD_ASSIGNTURKEE,
        selectedLearner,
        localInfo.roomName,
        0
      );

      // save atrium state to local storage
      this.updateAtriumState();
    } catch (error) {
      LogError(
        `'${localInfo.connectionId}' onAssignClicked exception: ${error.message}`
      );
    }
  }

  updateAtriumState() {
    let { selectedLearnerUserId, atriumLearners, localInfo } = this.state;

    try {
      const state = {
        roomName: localInfo.roomName,
        selectedLearnerUserId,
        atriumLearners,
      };

      playerState.SetAtrium(state);
    } catch (error) {
      LogError(
        `'${localInfo.connectionId}' updateAtriumState exception: ${error.message}`
      );
    }
  }

  // applies changes to connection status
  onConnectionChanged(connectionInfo) {
    try {
      const { localInfo } = this.state;
      localInfo.connectionId = connectionInfo.connectionId;

      this.setState({
        connectionStatus: connectionInfo,
        localInfo: localInfo,
      });
    } catch (error) {
      LogError(
        `'${connectionInfo.connectionId}' onConnectionChanged exception: ${error.message}`
      );
    }
  }

  onScreenPopup(props) {
    this.setState({
      infoOpen: true,
      infoMessage: props.message,
    });
  }

  handleInfoClose(event, reason) {
    if (reason === "clickaway") {
      return;
    }
    this.setState({ infoOpen: false });
  }

  render() {
    const {
      userName,
      connectionStatus,
      localInfo,
      sessionId,
      infoOpen,
      infoMessage,
      mapNodes,
    } = this.state;

    log.debug(`'${localInfo.connectionId}' OlabTurkerTag render '${userName}'`);

    try {
      // prevent anything interesting happening
      // until we are connected
      if (!connectionStatus || !localInfo?.assigned) {
        return <></>;
      }

      return (
        <>
          <Grid container item xs={12}>
            <TurkerChatCellGrid
              onScreenPopup={this.onScreenPopup}
              userName={userName}
              isModerator={true}
              connection={this.connection}
              roomName={localInfo.roomName}
              localInfo={localInfo}
              mapNodes={mapNodes}
            />
          </Grid>

          <br />

          {infoOpen === true && (
            <Snackbar
              open={infoOpen}
              autoHideDuration={3000}
              onClose={this.handleInfoClose}
            >
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
