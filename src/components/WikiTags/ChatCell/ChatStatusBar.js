// @flow
import * as React from 'react';
import {
  Grid
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import log from 'loglevel';
import styles from '../styles.module.css';

class ChatStatusBar extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      lastUpdate: null,
      localInfo: this.props.localInfo,
      connection: this.props.connection,
      isModerator: this.props.isModerator
    };

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

    if (this.props.isModerated) {

      let { lastUpdate } = this.state;
      if (lastUpdate) {
        const hours = `0${lastUpdate.getHours()}`;
        const minutes = `0${lastUpdate.getMinutes()}`;
        return `Last rec'd: ${hours.slice(hours.length - 2)}:${minutes.slice(minutes.length - 2, minutes.length)}`;
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
