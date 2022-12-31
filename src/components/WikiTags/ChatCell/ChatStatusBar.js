// @flow
import * as React from 'react';
import {
  Grid
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import log from 'loglevel';
import styles from '../styles.module.css';
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
      elapsedTime: null
    };

    this.messageTimer = null;
    this.connection = this.props.connection;

    this.onMessageTimer = this.onMessageTimer.bind(this);
    this.onMessageCallback = this.onMessageCallback.bind(this);

    var self = this;
    this.connection.on(constants.SIGNALMETHOD_MESSAGE, (payload) => { self.onMessageCallback(payload) });

  }

  // chat message method listener
  onMessageCallback(payload) {

    let {
      lastMessageTime,
      messageTimer,
      localInfo
    } = this.state;

    // ensure the message was for this chat box
    if (payload.recipientGroupName !== localInfo.commandChannel) {
      log.info(`onMessage: message not for '${localInfo.commandChannel}'`);
      return;
    }

    lastMessageTime = new Date();
    this.setState({
      elapsedTime: "00:00",
      lastMessageTime: lastMessageTime
    });

    // if no message timer and this is a moderator
    // then start the message timer
    if (!messageTimer && this.props.isModerator) {
      messageTimer = setInterval(this.onMessageTimer, 5000);
      log.debug(`setting timer ${messageTimer}. Room '${localInfo.commandChannel}'`);
      this.setState({ messageTimer: messageTimer });
    }

  }

  onMessageTimer() {

    let {
      elapsedTime,
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
      elapsedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    log.debug(`timer ${messageTimer} fired.  Room '${localInfo.commandChannel}'. time: ${elapsedTime}`);

    this.setState({ elapsedTime: elapsedTime });

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

  }

  generateCenterStatusString() {

    if (this.props.isModerator) {

      let { elapsedTime } = this.state;

      if (elapsedTime) {
        return `Elapsed time: ${elapsedTime} sec`;
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
