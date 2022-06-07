// @flow
import * as React from 'react';
import {
    Table, TableBody,
    TableCell, Paper, TableContainer,
    TableRow
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

    render() {

        const {
            InSession,
            IsConnected
        } = this.props.props;

        const {
            width
        } = this.state;

        let sessionName = "";
        let status = "";

        log.debug(`TurkeeChatStatusBar render. state = ${JSON.stringify(this.state)}`);

        try {

            if (IsConnected) {
                status = 'Connected';
                if (InSession) {
                    sessionName = "Online";
                }
                else {
                    sessionName = "Waiting for moderator";
                }
            }
            else {
                status = 'Disconnected';
                sessionName = "";
            }

            const divLayout = { width: width, border: '1px solid black', backgroundColor: '#3333' };

            return (
                <div style={divLayout}>
                    <TableContainer component={Paper}>
                        <Table className={'TurkeeStatusBar'} style={{ border: '1px solid black', backgroundColor: '#3333' }} size="small" aria-label="a dense table">
                            <TableBody sx={{ border: 1 }}>
                                <TableRow sx={{ border: 0, background: 'grey' }}>
                                    <TableCell>
                                        <div style={{ color: 'black' }}>{status}</div>
                                    </TableCell>
                                    <TableCell align="right">
                                        <div style={{ color: 'black' }}>{sessionName}</div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
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
