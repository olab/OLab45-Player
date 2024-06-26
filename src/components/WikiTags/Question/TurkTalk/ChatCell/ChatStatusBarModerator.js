// @flow
import * as React from "react";
import { Grid } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { Log, LogInfo, LogError } from "../../../../../utils/Logger";
import log from "loglevel";
import styles from "../../../styles.module.css";
import { connect } from "formik";
import { LastPageOutlined } from "@material-ui/icons";
var constants = require("../../../../../services/constants");

class ChatStatusBarModerator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      lastUpdate: null,
      localInfo: this.props.localInfo,
      connection: this.props.connection,
      lastMessageTime: null,
      centerStatusString: null,
    };

    this.messageTimer = null;
    this.connectionId = this.props.connection.connectionId?.slice(-3);

    this.onMessageTimer = this.onMessageTimer.bind(this);
    this.onMessage = this.onMessage.bind(this);

    var chatStatusBarSelf = this;

    this.props.connection.on(constants.SIGNALMETHOD_MESSAGE, (payload) => {
      chatStatusBarSelf.onMessage(payload);
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.show !== this.props.show) {
      this.setState({ show: this.props.show });
    }
    if (prevProps.localInfo !== this.props.localInfo) {
      this.setState({ localInfo: this.props.localInfo });
    }
  }

  // chat message method listener
  onMessage(payload) {
    let { lastMessageTime, messageTimer, localInfo } = this.state;

    // ensure the message was for this chat box
    if (payload.SessionId !== localInfo.sessionId) {
      return;
    }

    // tri-ary flag:
    //  true = locally initiated message (echo),
    //  false = remotely initiated message
    //  null - system message
    let isLocalMessage = null;

    // if not system message, determine locality
    // of message
    if (!payload.IsSystemMessage) {
      isLocalMessage = localInfo.ToSessionId == payload.FromSessionId;
    }

    // test if incoming message from remote side, meaning we set
    // the last incoming message time and start the timer
    if (!isLocalMessage) {
      lastMessageTime = new Date();
      this.setState({
        centerStatusString: "00:00",
        lastMessageTime: lastMessageTime,
      });

      // if no message timer start one
      if (!messageTimer) {
        messageTimer = setInterval(this.onMessageTimer, 5000);
        log.debug(
          `'${this.connectionId}' setting timer ${messageTimer}. Room '${localInfo.commandChannel}'`
        );
        this.setState({ messageTimer: messageTimer });
      }
    }

    // message is from myself, so remove the timer
    else {
      clearInterval(messageTimer);

      lastMessageTime = null;
      this.setState({
        centerStatusString: "-",
        lastMessageTime: lastMessageTime,
        messageTimer: null,
      });

      log.debug(
        `'${this.connectionId}' clearing timer. Room '${localInfo.commandChannel}'`
      );
    }
  }

  onMessageTimer() {
    let { centerStatusString, lastMessageTime, localInfo, messageTimer } =
      this.state;

    if (!lastMessageTime) {
      return;
    }

    const epochLast = lastMessageTime.getTime();
    const epochNow = new Date().getTime();

    var diffSeconds = Math.floor((epochNow - epochLast) / 1000);
    if (diffSeconds !== 0) {
      let minutes = Math.floor(diffSeconds / 60);
      let seconds = diffSeconds - minutes * 60;
      centerStatusString = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    log.debug(
      `'${this.connectionId}'  timer ${messageTimer} fired.  Room '${localInfo.commandChannel}'. seconds: ${diffSeconds}`
    );

    this.setState({ centerStatusString: centerStatusString });
  }

  generateLeftStatusString() {
    let { connection } = this.state;
    if (connection.connectionId && connection.connectionId.length > 0) {
      return "-";
    } else {
      return connection._connectionState;
    }
  }

  generateCenterStatusString() {
    let { centerStatusString } = this.state;
    if (centerStatusString) {
      return centerStatusString;
    }

    return "-";
  }

  generateRightStatusString() {
    let { senderInfo } = this.state;
    return senderInfo?.nickName;
  }

  render() {
    try {
      let { show } = this.state;

      if (!show) {
        return null;
      }

      const statusLeftString = this.generateLeftStatusString();
      const statusCenterString = this.generateCenterStatusString();
      const statusRightString = this.generateRightStatusString();

      const divLayout = {
        width: "100%",
        border: "2px solid black",
        backgroundColor: "#3333",
        borderTop: "0px solid black",
      };
      const gridLayout = { fontWeight: "bold", backgroundColor: "#grey" };

      return (
        <div name="chatStatusBar" style={divLayout}>
          <Grid container style={gridLayout}>
            <Grid container justifyContent="flex-start" item xs={4}>
              &nbsp;{statusLeftString}
            </Grid>
            <Grid container justifyContent="center" item xs={4}>
              {statusCenterString}
            </Grid>
            <Grid container justifyContent="flex-end" item xs={4}>
              {statusRightString}&nbsp;
            </Grid>
          </Grid>
        </div>
      );
    } catch (error) {
      return <b>ChatStatusBarModerator: {error.message}</b>;
    }
  }
}

export default withStyles(styles)(ChatStatusBarModerator);
