// @flow
import * as React from 'react';
import {
  Grid
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import log from 'loglevel';
import styles from '../styles.module.css';
import { connect } from 'formik';
var constants = require('../../../services/constants');

class ChatStatusBar extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      lastUpdate: null,
      localInfo: this.props.localInfo,
      connection: this.props.connection,
      isModerator: this.props.isModerator,
      lastMessageTime: null,
      centerStatusString: null
    };

    this.messageTimer = null;
    this.connectionId = this.props.connection.connectionId?.slice(-3);

    this.onMessageTimer = this.onMessageTimer.bind(this);
    this.onMessageCallback = this.onMessageCallback.bind(this);

    var self = this;

    this.state.connection.on(constants.SIGNALCMD_COMMAND, (payload) => {
      if (payload.commandChannel === this.state.localInfo.commandChannel) {
        self.onCommandCallback(payload);
      }
    });

    this.state.connection.on(constants.SIGNALMETHOD_MESSAGE, (payload) => {
      if (payload.commandChannel === this.state.localInfo.commandChannel) {
        self.onMessageCallback(payload);
      }
    });

  }

  // command method listener
  onCommandCallback(payload) {

    log.debug(`'${this.connectionId}' onChatStatusBarCommandCallback: ${payload.command}`);

    if (payload.command === constants.SIGNALCMD_LEARNER_UNASSIGNED) {
      this.onLearnerUnassigned(payload.data);
    }

    else {
      log.debug(`'${this.connectionId}' onChatStatusBarCommandCallback: ignoring command: '${payload.command}'`);
    }

  }

  onLearnerUnassigned(payload) {

    let {
      isModerator,
      messageTimer,
      centerStatusString
    } = this.state;

    if (isModerator) {
      clearInterval(messageTimer);
      messageTimer = null;
      centerStatusString = '-';

      this.setState({
        messageTimer: messageTimer, centerStatusString: centerStatusString
      });
    }

  }

  // chat message method listener
  onMessageCallback(payload) {

    let {
      lastMessageTime,
      messageTimer,
      localInfo
    } = this.state;

    lastMessageTime = new Date();
    this.setState({
      centerStatusString: "00:00",
      lastMessageTime: lastMessageTime
    });

    // if no message timer and this is a moderator
    // then start the message timer
    if (!messageTimer && this.props.isModerator) {
      messageTimer = setInterval(this.onMessageTimer, 5000);
      log.debug(`'${this.connectionId}' setting timer ${messageTimer}. Room '${localInfo.commandChannel}'`);
      this.setState({ messageTimer: messageTimer });
    }

  }

  onMessageTimer() {

    let {
      centerStatusString,
      lastMessageTime,
      localInfo,
      messageTimer
    } = this.state;

    const epochLast = lastMessageTime.getTime();
    const epochNow = new Date().getTime();

    var diffSeconds = Math.floor((epochNow - epochLast) / 1000);
    if (diffSeconds !== 0) {
      let minutes = Math.floor(diffSeconds / 60);
      let seconds = diffSeconds - minutes * 60;
      centerStatusString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    log.debug(`'${this.connectionId}'  timer ${messageTimer} fired.  Room '${localInfo.commandChannel}'. seconds: ${diffSeconds}`);

    this.setState({ centerStatusString: centerStatusString });

  }

  generateLeftStatusString() {

    let { connection, isModerator } = this.state;
    if (connection.connectionId && (connection.connectionId.length > 0)) {
      if (!isModerator) {
        return `${connection._connectionState} (Id: ${connection.connectionId.slice(-3)})`;
      }
      else {
        return '-';
      }

    }
    else {
      return connection._connectionState;
    }

  }

  generateCenterStatusString() {

    if (this.props.isModerator) {

      let { centerStatusString } = this.state;

      if (centerStatusString) {
        return centerStatusString;
      }

    }

    return '-';

  }

  generateRightStatusString() {

    if (this.props.isModerator) {
      let { localInfo } = this.state;
      return localInfo?.nickName;
    }

    return null;
  }

  render() {

    try {

      const statusLeftString = this.generateLeftStatusString();
      const statusCenterString = this.generateCenterStatusString();
      const statusRightString = this.generateRightStatusString();

      const divLayout = { width: '100%', border: '2px solid black', backgroundColor: '#3333', borderTop: '0px solid black' };
      const gridLayout = { fontWeight: 'bold', backgroundColor: '#grey' };

      return (
        <div style={divLayout}>
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
      return (
        <b>ChatStatusBar: {error.message}</b>
      );
    }
  }

}

export default withStyles(styles)(ChatStatusBar);
