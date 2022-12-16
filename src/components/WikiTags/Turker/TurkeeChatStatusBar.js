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

  generateLeftStatusString() {

    const {
      connection,
    } = this.props;

    if (this.props.learnerInfo.nickName) {

      if (this.props.learnerInfo.connected) {
        return "Assigned";
      }
      else {
        return "Disconnected";
      }
    }

    return '';

  }

  generateCenterStatusString() {
    return this.props.learnerInfo.lastMessageTime;
  }

  generateRightStatusString() {
    return this.props.learnerInfo.nickName;
  }

  render() {

    log.debug(`TurkeeChatStatusBar render. state = ${JSON.stringify(this.state)}`);

    let {
      width,
    } = this.state;

    try {

      const statusLeftString = this.generateLeftStatusString();
      const statusCenterString = this.generateCenterStatusString();
      const statusRightString = this.generateRightStatusString();
      const divLayout = { width: width, border: '2px solid black', backgroundColor: '#3333', borderTop: '0px solid black' };

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
        <b>TurkeeStatusBar: {error.message}</b>
      );
    }
  }

}

export default withStyles(styles)(TurkeeChatStatusBar);
