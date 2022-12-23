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
      connection: this.props.connection
    };

  }

  generateLeftStatusString() {

    let { connection } = this.state;
    if (connection.connectionId && (connection.connectionId.length > 0))
      return `${connection._connectionState} (Id: ${connection.connectionId.slice(-3)})`;
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

  }

  generateRightStatusString() {

    if (this.props.isModerated) {
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

      return (
        <div style={divLayout}>
          <Grid container className={'TurkeeStatusBar'} style={{ fontWeight: 'bold', backgroundColor: '#grey' }}>
            <Grid item xs={5}>
              <div style={{ marginLeft: '10px', textAlign: 'left' }}>{statusLeftString}</div>
            </Grid>
            <Grid item xs={2}>
              <div style={{ textAlign: 'center' }}>{statusCenterString}</div>
            </Grid>
            <Grid item xs={5}>
              <div style={{ marginRight: '10px', textAlign: 'right' }}>{statusRightString}&nbsp;</div>
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
