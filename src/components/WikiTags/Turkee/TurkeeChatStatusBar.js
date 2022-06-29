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

        const {
            ConnectionId,
            Name
        } = this.props.remoteInfo;

        if ((ConnectionId) && (ConnectionId.length > 0)) {
            return `${Name} (Id: ${ConnectionId.substring(0, 3)})`;
        }
        else {
            return 'Waiting';
        }

    }

    generateCenterStatusString() {

        const {
            ConnectionId,
        } = this.props.localInfo;

        let roomString = '';

        if (this.props.remoteInfo.RoomName) {
            roomString = `Room: ${this.props.remoteInfo.RoomName}`;
        }

        if ((ConnectionId) && (ConnectionId.length > 0)) {
            return roomString;
        }
    }

    generateLeftStatusString() {

        const {
            ConnectionId,
        } = this.props.localInfo;

        if ((ConnectionId) && (ConnectionId.length > 0)) {
            return `${this.props.connectionStatus} (Id: ${ConnectionId.substring(0, 3)})`;
        }
        else {
            return this.props.connectionStatus;
        }

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
