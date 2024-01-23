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
import Popup from "../Popup/Popup";
var constants = require("../../../../../services/constants");
const playerState = require("../../../../../utils/PlayerState").PlayerState;

class OlabAttendeeTag extends React.Component {
  constructor(props) {
    super(props);

    const debug = playerState.GetDebug();

    this.state = {
      connection: null,
      connectionStatus: null,
      debug,
      inAtrium: false,
      progressMessage: "Loading...",
      popupMessage: null,
      popupShow: null,
      popupSeverity: "info",
      inRoom: false,
      localInfo: null,
      maxHeight: 200,
      remoteInfo: null,
      seatNumber: 0,
      userName: null,
      width: "100%",
    };

    this.onAuthenticated = this.onAuthenticated.bind(this);
    this.onNavigateToNode = this.onNavigateToNode.bind(this);
    this.onAtriumAccepted = this.onAtriumAccepted.bind(this);
    this.onJumpNode = this.onJumpNode.bind(this);
    this.onServerMessage = this.onServerMessage.bind(this);
    this.onRoomAccepted = this.onRoomAccepted.bind(this);
    this.handleInfoClose = this.handlePopupClose.bind(this);
    this.displayErrorPopup = this.displayErrorPopup.bind(this);
    this.displayInfoPopup = this.displayInfoPopup.bind(this);

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

  handlePopupClose(event, reason) {
    if (reason === "clickaway") {
      return;
    }
    this.setState({ popupShow: false });
  }

  // display info message in popup
  displayInfoPopup(message) {
    this.setState({
      popupShow: true,
      popupMessage: message,
      popupSeverity: "info",
    });
  }

  // display error message in popup
  displayErrorPopup(message) {
    this.setState({
      popupShow: true,
      popupMessage: message,
      popupSeverity: "error",
    });
  }

  // handle learner authorized event
  onAuthenticated() {
    // initialize learner-specific flags
    this.turkeeService.localInfo.isModerator = false;
    this.turkeeService.localInfo.SeatNumber = null;

    this.setState({
      connection: this.turkeeService.connection,
      connectionStatus: this.turkeeService.connection._connectionState,
      progressMessage: `${this.turkeeService.connection._connectionState}, waiting for assignment.`,
      localInfo: this.turkeeService.localInfo,
    });
  }

  // jump to new url
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
    this.displayInfoPopup(payload.data);
  }

  // moderator is sending the learner to a new node
  async onJumpNode(payload) {
    try {
      let { mapId, nodeId, nodeName } = payload.data;

      this.displayInfoPopup(`Moderator is sending you to '${nodeName}'`);

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
      let { localInfo } = this.state;
      log.debug(
        `onAtriumAccepted user '${localInfo.userId}' ${JSON.stringify(payload)}`
      );

      this.setState({
        inAtrium: true,
        inRoom: false,
        progressMessage: `Waiting for moderator...`,
      });

      this.dumpConnectionState();
    } catch (error) {
      LogError(
        `'${this.connectionId}' onAtriumAccepted exception: ${error.message}`
      );
    }
  }

  // learner has been assigned to a room
  onRoomAccepted(payload) {
    try {
      let { localInfo } = this.state;

      log.debug(
        `onRoomAccepted user '${localInfo.userId}' ${JSON.stringify(payload)}`
      );

      // update seat number from server
      localInfo.SeatNumber = payload.SeatNumber;

      this.setState({
        inRoom: true,
        inAtrium: false,
        remoteInfo: payload.Moderator,
        localInfo,
      });

      this.dumpConnectionState();
    } catch (error) {
      LogError(
        `'${this.connectionId}' onRoomAccepted exception: ${error.message}`
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
      popupMessage,
      progressMessage,
      popupShow,
      popupSeverity,
      inRoom,
      localInfo,
      remoteInfo,
      seatNumber,
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
                {progressMessage && (
                  <div style={{ textAlign: "center" }}>
                    <p>
                      <b>{progressMessage}</b>
                    </p>
                  </div>
                )}

                {(inAtrium || inRoom) && (
                  <ChatCell
                    seatNumber={seatNumber}
                    style={chatCellStyle}
                    localInfo={localInfo}
                    remoteInfo={remoteInfo}
                    connection={connection}
                  />
                )}
              </TableRow>
            </TableBody>
          </Table>

          <Popup
            open={popupShow}
            message={popupMessage}
            level={popupSeverity}
          />

          {/* {popupShow === true && (
            <Snackbar
              open={popupShow}
              autoHideDuration={3000}
              onClose={this.handlePopupClose}>
              <Alert onClose={this.handlePopupClose} severity={popupSeverity}>
                {popupMessage}
              </Alert>
            </Snackbar>
          )} */}
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
