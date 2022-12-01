// @flow
import * as React from 'react';
import {
  Grid
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import log from 'loglevel';
import styles from '../styles.module.css';

class TurkeeChatStatusBar extends React.Component {

  constructor(props) {

    super(props);
    this.state = {
      width: '100%',
    };

  }

  generateRightStatusString() {

    // const {
    //     assignedTo,
    // } = this.props.remoteInfo;

    // if (assignedTo === "room") {
    //     return `Room`;
    // }

    // else if (assignedTo === "atrium") {
    //     return 'Waiting for Moderator';
    // }
    if ( this.props.localInfo.RoomName == null) {
      return "Waiting";
    }
    else {
      return "Assigned";
    }


  }

  generateCenterStatusString() {

    const {
      ConnectionId,
    } = this.props.localInfo;

    let roomString = '';

    // if (this.props.remoteInfo.RoomName) {
    //     roomString = `Room: ${this.props.remoteInfo.RoomName}`;
    // }

    // if ((ConnectionId) && (ConnectionId.length > 0)) {
    //     return roomString;
    // }
  }

  generateLeftStatusString() {

    const {
      connection,
    } = this.props;

    if ( connection.connectionId && (connection.connectionId.length > 0) )
      return `${connection._connectionState} (Id: ${connection.connectionId.slice(-3)})`;

    return 'Not Connected';
  }

  render() {

    log.debug(`TurkeeChatStatusBar render. state = ${JSON.stringify(this.state)}`);

    let {
      width,
    } = this.state;

    try {

      const statusRightString = this.generateRightStatusString();
      const statusLeftString = this.generateLeftStatusString();
      const statusCenterString = this.generateCenterStatusString();
      const divLayout = { width: width, border: '2px solid black', backgroundColor: '#3333', borderTop: '0px solid black' };

      return (
        <div style={divLayout}>
          <Grid container className={'TurkeeStatusBar'} style={{ fontWeight: 'bold', backgroundColor: '#grey' }}>
            <Grid item xs={4}>
              <div style={{ marginLeft: '10px', textAlign: 'left' }}>{statusLeftString}</div>
            </Grid>
            <Grid item xs={4}>
              <div style={{ textAlign: 'center' }}>{statusCenterString}</div>
            </Grid>
            <Grid item xs={4}>
              <div style={{ marginRight: '10px', textAlign: 'right' }}>{statusRightString}&nbsp;</div>
            </Grid>
          </Grid>
        </div>
      );

    } catch (error) {
      return (
        <b>TurkeeStatusBar: {error.message}</b>
      );
    }
  }

}

export default withStyles(styles)(TurkeeChatStatusBar);
