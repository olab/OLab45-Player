// @flow
import * as React from 'react';
import {
  Grid
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import log from 'loglevel';
import styles from '../styles.module.css';

class TurkerChatStatusBar extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      width: '100%',
    };

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

    if (connection.connectionId && (connection.connectionId.length > 0))
      return `${connection._connectionState} (Id: ${connection.connectionId.substring(0, 3)})`;

    return 'Not Connected';
  }

  render() {

    log.debug(`TurkerChatStatusBar render. state = ${JSON.stringify(this.state)}`);

    let {
      width,
    } = this.state;

    try {

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
              &nbsp;
            </Grid>
          </Grid>
        </div>
      );

    } catch (error) {
      return (
        <b>TurkerStatusBar: {error.message}</b>
      );
    }
  }

}

export default withStyles(styles)(TurkerChatStatusBar);
