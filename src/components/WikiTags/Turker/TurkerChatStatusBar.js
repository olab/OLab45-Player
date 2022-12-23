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

    this.isModerator = this.props.isModerator;
  }

  generateCenterStatusString() {

    const { localInfo } = this.props;
    return localInfo?.roomName;

    // if (this.props.remoteInfo.RoomName) {
    //     roomString = `Room: ${this.props.remoteInfo.RoomName}`;
    // }
  }

  generateLeftStatusString() {

    const { connection } = this.props;
    if (connection.connectionId && (connection.connectionId.length > 0))
      return `${connection._connectionState} (Id: ${connection.connectionId.slice(-3)})`;

    return 'Not Connected';
  }

  render() {

    log.debug(`TurkerChatStatusBar render. state = ${JSON.stringify(this.state)}`);

    let {
      width,
      localInfo
    } = this.state;

    try {

      const statusLeftString = this.generateLeftStatusString();
      const statusCenterString = this.generateCenterStatusString();
      const divLayout = { width: width, border: '2px solid black', backgroundColor: '#3333', borderTop: '0px solid black' };

      return (
        <div style={divLayout}>
          <Grid container className={'TurkeeStatusBar'} style={{ fontWeight: 'bold', backgroundColor: '#grey' }}>
            <Grid item xs={4}>
              <span style={{ marginLeft: '10px', textAlign: 'left' }}>{statusLeftString}</span>
            </Grid>
            <Grid item xs={4}>
              <span style={{ textAlign: 'center' }}>{statusCenterString}</span>
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
