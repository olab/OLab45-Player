// @flow
import * as React from "react";
import { Log, LogInfo, LogError } from "../../../../../utils/Logger";
import log from "loglevel";
import { withStyles } from "@material-ui/core/styles";
import { Table, TableBody, TableRow, Snackbar } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";

import Turkee from "../../../../../services/turkee";
import styles from "../../../styles.module.css";
import ChatCell from "../../../../ChatCell/ChatCell";
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

    this.slotManager = new SlotManager(1);
    // this makes the chat and status bar
    // components visible
    this.slotManager.RemoteSlots()[0].show = true;

    let session = new Session(props.props);
    const debug = playerState.GetDebug();

    this.state = {
      debug,
      connectionStatus: null,
      index: 0,
      infoOpen: null,
      infoMessage: null,
      localInfo: new SlotInfo({ connectionId: "???" }),
      maxHeight: 200,
      remoteInfo: new SlotInfo(),
      session: session,
      slotInfos: this.slotManager.RemoteSlots(),
      userName: props.props.authActions.getUserName(),
      width: "100%",
      inAtrium: false,
      inRoom: false,
    };

    this.turkee = new Turkee(this);
    this.signalr = this.turkee.signalr;

    this.turkee.connect(this.state.userName);
    this.connection = this.turkee.connection;
    this.connectionId = "";

    this.handleInfoClose = this.handleInfoClose.bind(this);
    this.onAtriumAssigned = this.onAtriumAssigned.bind(this);
    this.onJumpNode = this.onJumpNode.bind(this);
    this.onServerMessage = this.onServerMessage.bind(this);

    var turkeeSelf = this;
    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => {
      turkeeSelf.onCommand(payload);
    });
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

  onCommand(payload) {
    try {
      if (payload.command === constants.SIGNALCMD_ROOMASSIGNED) {
        log.debug(`'${this.connectionId}' onCommand: ${payload.command}`);
        this.onRoomAssigned(payload.data);
      } else if (payload.command === constants.SIGNALCMD_ATRIUMASSIGNED) {
        log.debug(`'${this.connectionId}' onCommand: ${payload.command}`);
        this.onAtriumAssigned(payload.data);
      } else if (payload.command === constants.SIGNALCMD_JUMP_NODE) {
        log.debug(`'${this.connectionId}' onCommand: ${payload.command}`);
        this.onJumpNode(payload);
      } else if (payload.command === constants.SIGNALCMD_SERVER_ERROR) {
        log.debug(`'${this.connectionId}' onCommand: ${payload.command}`);
        this.onServerMessage(payload);
      }
    } catch (error) {
      LogError(
        `'${this.connectionId}' onTurkeeCommandCallback exception: ${error.message}`
      );
    }
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
  onAtriumAssigned(payload) {
    try {
      let { userName } = this.state;

      log.debug(
        `onAtriumAssigned message for '${userName}' ${JSON.stringify(payload)}`
      );

      payload.isModerator = false;
      payload.show = true;
      payload.connectionId = payload.connectionId.slice(-3);

      this.slotManager.assignLocalInfo(payload);
      var localInfo = this.slotManager.LocalSlots()[0];

      this.setState({
        localInfo: localInfo,
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

      const { localInfo } = this.state;
      this.slotManager.assignLearner(localInfo, payload.remote);

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
  }

  async componentWillUnmount() {
    log.debug(`'${this.connectionId}' OlabAttendeeTag unmounting`);

    this.componentMounted = false;

    if (this.turkee) {
      await this.turkee.disconnect();
      this.turkee = null;
    }
  }

  // the contextId has changed
  oncontextIdChanged(Id) {
    let { chatInfo } = this.state;

    chatInfo.Id = Id;

    this.setState({ chatInfo });
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
      index,
      debug,
      remoteInfo,
      localInfo,
      userName,
      session,
      infoOpen,
      infoMessage,
      inAtrium,
      inRoom,
    } = this.state;

    const tableStyle = {
      border: "2px solid black",
      backgroundColor: "#3333",
      width: "100%",
    };
    const chatCellStyle = { width: "100%" };
    const stemStyle = { paddingBottom: "5px" };

    log.debug(`'${localInfo.connectionId}' OlabTurkeeTag render '${userName}'`);

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
                {!inAtrium && infoMessage && (
                  <div style={{ textAlign: "center" }}>
                    <p>
                      <b>{infoMessage}</b>
                    </p>
                  </div>
                )}
                {(inAtrium || inRoom) && (
                  <ChatCell
                    index={index}
                    isModerator={localInfo.isModerator}
                    style={chatCellStyle}
                    localInfo={localInfo}
                    senderInfo={remoteInfo}
                    session={session}
                    playerProps={this.props.props}
                    connection={this.connection}
                    signalr={this.signalr}
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
          <b>
            [[QU:{this.props.props.question.id}]] "{error.message}"
          </b>
        </>
      );
    }
  }
}

export default withStyles(styles)(OlabAttendeeTag);
