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

    this.updateMessageTimer = this.updateMessageTimer.bind(this);

    var self = this;
    this.connection.on(constants.SIGNALMETHOD_MESSAGE, (payload) => { self.onMessageCallback(payload) });

  }

  // chat message method listener
  onMessageCallback(payload) {

    let {
      lastMessageTime
    } = this.state;

    lastMessageTime = new Date();
    this.setState({ 
      elapsedTime: "00:00", 
      lastMessageTime: lastMessageTime });

    // if no message timer and this is a moderator
    // then start the message timer
    if (!this.messageTimer && this.props.isModerator) {
      this.messageTimer = setInterval(this.updateMessageTimer, 5000);
    }

  }

  updateMessageTimer() {

    let { 
      elapsedTime, 
      lastMessageTime 
    } = this.state;

    const epochLast = lastMessageTime.getTime();
    const epochNow = new Date().getTime();

    var diffSeconds = Math.floor((epochNow - epochLast) / 1000);
    if ( diffSeconds !== 0 ) {
      let minutes = Math.floor(diffSeconds/60);
      let seconds = diffSeconds - minutes * 60;
      elapsedTime = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
    }

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
