// @flow
import * as React from 'react';
import {
  Grid, Box
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Log, LogInfo, LogError } from '../../../../../utils/Logger';
import styles from '../../../styles.module.css';

class TurkerChatStatusBar extends React.Component {

  constructor(props) {

    super(props);

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

  generateRightStatusString() {
    return null;
  }

  render() {

    Log(`TurkerChatStatusBar render. state = ${JSON.stringify(this.state)}`);

    try {

      const statusLeftString = this.generateLeftStatusString();
      const statusCenterString = this.generateCenterStatusString();
      const statusRightString = this.generateRightStatusString();

      const divLayout = { width: '100%', border: '2px solid black', backgroundColor: '#3333', borderTop: '0px solid black' };
      const gridLayout = { marginLeft: '10px', fontWeight: 'bold', backgroundColor: '#grey' };

      return (
        <div style={divLayout}>
          <Grid container className={'TurkeeStatusBar'} style={gridLayout}>
            <Grid container justifyContent="flex-start" item xs={4}>
              {statusLeftString}
            </Grid>
            <Grid container justifyContent="center" item xs={4}>
              {statusCenterString}
            </Grid>
            <Grid container justifyContent="flex-start" item xs={4}>
              {statusRightString}
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
