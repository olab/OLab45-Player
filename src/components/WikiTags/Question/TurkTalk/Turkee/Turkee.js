// @flow
import * as React from "react";
import { Log, LogInfo, LogError } from "../../../../../utils/Logger";
import log from "loglevel";
import { withStyles } from "@material-ui/core/styles";
import { Table, TableBody, TableRow, Snackbar } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";

import TurkeeService from "../../../../../services/TurkeeService";
import styles from "../../../styles.module.css";
import ChatCell from "../ChatCell/ChatCell";
import SlotInfo from "../../../../../helpers/SlotInfo";
import SlotManager from "../SlotManager";
import Session from "../../../../../services/session";

var constants = require("../../../../../services/constants");
const playerState = require("../../../../../utils/PlayerState").PlayerState;

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class OlabAttendeeTag extends React.Component {
  constructor(props) {
    super(props);

    const debug = playerState.GetDebug();

    this.state = {
      connection: null,
      connectionStatus: null,
      debug,
      inAtrium: false,
      infoMessage: "Loading...",
      infoOpen: null,
      infoSeverity: "info",
      inRoom: false,
      localInfo: null,
      maxHeight: 200,
      remoteInfo: null,
      seatNumber: 0,
      userName: null,
      width: "100%",
    };

    this.onConnected = this.onConnected.bind(this);
    this.onNavigateToNode = this.onNavigateToNode.bind(this);
    this.onAtriumAccepted = this.onAtriumAccepted.bind(this);
    this.onJumpNode = this.onJumpNode.bind(this);
    this.onServerMessage = this.onServerMessage.bind(this);
    this.handleInfoClose = this.handleInfoClose.bind(this);
    this.onError = this.onError.bind(this);

    this.turkeeService = new TurkeeService(this);
  }

  dumpConnectionState() {
    var infoState = { localInfo: this.state.localInfo, remoteInfo: null };
    log.debug(
      `'${this.connectionId}' dumpConnectionState localInfo = ${JSON.stringify(
        infoState,
        null,
        2
      )}]`
    );
  }

  handleInfoClose(event, reason) {
    if (reason === "clickaway") {
      return;
    }
    this.setState({ infoOpen: false });
  }

  onError(message) {
    this.setState({
      infoOpen: true,
      infoMessage: message,
      infoSeverity: "error",
    });
  }

  onConnected() {
    this.setState({
      connection: this.turkeeService.connection,
      connectionStatus: this.turkeeService.connection._connectionState,
      infoMessage: `${this.turkeeService.connection._connectionState}, waiting for assignment.`,
      localInfo: this.turkeeService.localInfo,
    });
  }

  onNavigateToNode = (mapId, nodeId, urlParam = null) => {
    let url = `/player/${mapId}/${nodeId}`;
    if (urlParam) {
      url += `/${urlParam}`;
    }

    log.debug(`navigating to ${url}`);

    window.location.href = url;
  };

  // system is sending a message to turkee
  onServerMessage(payload) {
    const { inAtrium, inRoom } = this.state;

    try {
      if (inRoom) {
        this.setState({
          infoOpen: true,
          infoMessage: payload.data,
        });
      } else if (!inAtrium) {
        this.setState({
          infoMessage: payload.data,
        });
      }
    } catch (error) {
      LogError(
        `'${this.connectionId}' onServerMessage exception: ${error.message}`
      );
    }
  }

  // moderator is sending the learner to a new node
  async onJumpNode(payload) {
    try {
      let { mapId, nodeId, nodeName } = payload.data;

      this.setState({
        infoOpen: true,
        infoMessage: `Moderator is sending you to '${nodeName}'`,
      });

      // pause for 5 seconds
      await new Promise((r) => setTimeout(r, 4000));

      this.onNavigateToNode(mapId, nodeId);
    } catch (error) {
      LogError(`'${this.connectionId}' onJumpNode exception: ${error.message}`);
    }
  }

  // learner has been assigned to an atrium
  onAtriumAccepted(payload) {
    try {
      let { userName } = this.state;

      log.debug(
        `onAtriumAssigned message for '${userName}' ${JSON.stringify(payload)}`
      );

      // payload.isModerator = false;
      // payload.show = true;
      // payload.connectionId = payload.connectionId.slice(-3);

      // this.slotManager.assignLocalInfo(payload);
      // var localInfo = this.slotManager.LocalSlots()[0];

      this.setState({
        // localInfo: null,
        remoteInfo: null,
        inAtrium: true,
      });

      this.dumpConnectionState();
    } catch (error) {
      LogError(
        `'${this.connectionId}' onAtriumAssigned exception: ${error.message}`
      );
    }
  }

  onRoomAssigned(payload) {
    try {
      let { userName } = this.state;

      log.debug(
        `onRoomAssigned message for '${userName}' ${JSON.stringify(payload)}`
      );

      this.setState({
        showChatGrid: true,
        localInfo: this.slotManager.LocalSlots()[0],
        remoteInfo: this.slotManager.remoteSlots[0],
        inRoom: true,
      });

      this.dumpConnectionState();
    } catch (error) {
      LogError(
        `'${this.connectionId}' onRoomAssigned exception: ${error.message}`
      );
    }
  }

  componentDidMount() {
    this.componentMounted = true;
    this.turkeeService.connect();
  }

  async componentWillUnmount() {
    log.debug(`'${this.connectionId}' OlabAttendeeTag unmounting`);

    this.componentMounted = false;

    if (this.turkeeService) {
      await this.turkeeService.onDisconnecting();
      this.turkeeService = null;
    }
  }

  // applies changes to connection status
  onConnectionChanged(connectionInfo) {
    let { remoteInfo, localInfo } = this.state;
    localInfo.connectionId = connectionInfo.connectionId;

    this.setState({
      connectionStatus: connectionInfo,
      remoteInfo: remoteInfo,
    });

    this.connectionId = connectionInfo.connectionId;
  }

  render() {
    const {
      connection,
      debug,
      inAtrium,
      infoMessage,
      infoOpen,
      infoSeverity,
      inRoom,
      localInfo,
      remoteInfo,
      seatNumber,
      session,
    } = this.state;

    const tableStyle = {
      border: "2px solid black",
      backgroundColor: "#3333",
      width: "100%",
    };
    const chatCellStyle = { width: "100%" };
    const stemStyle = { paddingBottom: "5px" };

    try {
      if (debug.disableWikiRendering) {
        return <>[[QU:{this.props.props.question.id}]]</>;
      }

      return (
        <>
          <div style={stemStyle}>{this.props.props.question.stem}</div>
          <Table style={tableStyle}>
            <TableBody>
              <TableRow>
                {!connection && infoMessage && (
                  <div style={{ textAlign: "center" }}>
                    <p>
                      <b>{infoMessage}</b>
                    </p>
                  </div>
                )}

                {(inAtrium || inRoom) && (
                  <ChatCell
                    seatNumber={seatNumber}
                    style={chatCellStyle}
                    localInfo={localInfo}
                    connection={connection}
                  />
                )}
              </TableRow>
            </TableBody>
          </Table>

          {infoOpen === true && (
            <Snackbar
              open={infoOpen}
              autoHideDuration={3000}
              onClose={this.handleInfoClose}
            >
              <Alert onClose={this.handleInfoClose} severity={infoSeverity}>
                {infoMessage}
              </Alert>
            </Snackbar>
          )}
        </>
      );
    } catch (error) {
      return (
        <>
          <b>
            [[QU:{this.props.props.question.id}]] "{error.message}"
          </b>
        </>
      );
    }
  }
}

export default withStyles(styles)(OlabAttendeeTag);
