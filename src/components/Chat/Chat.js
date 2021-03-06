// @flow
import * as React from 'react';
import {
    Button, Table, TableBody,
    TableCell, Paper, TableContainer,
    TableHead, TableRow, TextField
} from '@material-ui/core';
import log from 'loglevel';
import { withStyles } from '@material-ui/core/styles';
import styles from '../WikiTags/styles.module.css';
import { HubConnectionState } from '@microsoft/signalr';

var constants = require('../../services/constants');

class Chat extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            conversation: [],
            maxHeight: 200,
            message: '',
            width: '100%',
            playerProps: this.props.playerProps
        };

        this.connection = this.props.connection;

        // Binding this keyword  
        this.onMessageTextChanged = this.onMessageTextChanged.bind(this);
        this.onSendClicked = this.onSendClicked.bind(this);
        this.onMessageCallback = this.onMessageCallback.bind(this);
        this.onEchoCallback = this.onEchoCallback.bind(this);

        var self = this;
        this.connection.on(constants.SIGNALCMD_MESSAGE, (payload) => { self.onMessageCallback(payload) });
        this.connection.on(constants.SIGNALCMD_ECHO, (payload) => { self.onEchoCallback(payload) });

        log.debug(`Chat initialized.  id = '${this.props.localInfo.Name}(${this.props.localInfo.ConnectionId})'`);
    }

    onMessageCallback(payloadJson) {

        try {

            let payload = JSON.parse(payloadJson);
            log.info(`onMessageCallback (${this.props.localInfo.ConnectionId}): ${JSON.stringify(payload, null, 1)}`);

            if ((payload.Envelope.ToId !== this.props.localInfo.ConnectionId)
                || (payload.Envelope.FromId !== this.props.remoteInfo.ConnectionId)) {
                return;
            }

            let { conversation } = this.state;

            conversation.push(this.createData(conversation.length, payload.Data, false));

            this.setState({
                conversation: conversation
            });

        } catch (error) {
            log.error(`onMessageCallback exception: ${error.message}`);
        }

    }

    onEchoCallback(payloadJson) {

        try {

            let payload = JSON.parse(payloadJson);
            log.info(`onEchoCallback (${this.props.localInfo.ConnectionId}): ${JSON.stringify(payload, null, 1)}`);

            if ((payload.Envelope.ToId !== this.props.localInfo.ConnectionId)
                || (payload.Envelope.FromId !== this.props.remoteInfo.ConnectionId)) {
                return;
            }

            let { conversation } = this.state;

            conversation.push(this.createData(conversation.length, payload.Data, true));

            this.setState({
                conversation: conversation
            });

        } catch (error) {
            log.error(`onEchoCallback exception: ${error.message}`);
        }

    }

    onSendClicked = (event) => {

        try {

            const { message } = this.state;
            const { ConnectionId } = this.props.remoteInfo;

            if (ConnectionId === '') {
                log.error(`Nobody set to send to.`);
                return;
            }

            if (message.length > 0) {

                const messagePayload = {
                    envelope: {
                        fromId: this.props.localInfo.ConnectionId,
                        toId: this.props.remoteInfo.ConnectionId,
                    },
                    Data: message
                };

                this.connection.send(constants.SIGNALCMD_MESSAGE, messagePayload);
            }

            // clear out sent message
            this.setState({
                message: ''
            });

        } catch (error) {
            log.error(`onSendClicked exception: ${error.message}`);
        }

    }

    createData(key, message, isLocalMessage) {
        return { key, message, isLocalMessage };
    }

    onMessageTextChanged = (event) => {
        let message = this.state.message;

        this.setState(state => {
            message = event.target.value;
            return ({ message });
        });
        event.preventDefault();
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
            let room = this.props.remoteInfo.RoomName.replace("//", "|");
            const roomParts = room.split("|");
            const mapName = roomParts[0];
            const roomName = roomParts[1];
            const roomIndex = roomParts[2];
            roomString = `Case: ${mapName}. Room: ${roomName}:${roomIndex}`;
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

        let {
            conversation,
            maxHeight,
            message,
            width,
        } = this.state;

        const divLayout = { width: width, border: '1px solid black', backgroundColor: '#3333' };
        const tableContainerStyle = { height: '100%', maxHeight: maxHeight, backgroundColor: '#DDDDDD' };

        const statusRightString = this.generateRightStatusString();
        const statusLeftString = this.generateLeftStatusString();
        const statusCenterString  = this.generateCenterStatusString();

        const disabled = ((this.props.remoteInfo.ConnectionId === '') ||
            (this.props.connectionStatus !== HubConnectionState.Connected));

        try {

            return (
                <div style={divLayout}>

                    <TableContainer component={Paper} style={tableContainerStyle}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><center><b>Conversation</b></center></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {conversation.map((conversationItem) => (
                                    <TableRow key={conversationItem.key}>
                                        {conversationItem.isLocalMessage && (
                                            <TableCell align="left" style={{ paddingBottom: 0, paddingTop: 0 }}>
                                                <div
                                                    style={{
                                                        paddingRight: '10px',
                                                        color: 'green',
                                                        borderRadius: '5px'
                                                    }}
                                                >
                                                    {conversationItem.message}
                                                </div>
                                            </TableCell>
                                        )}
                                        {!conversationItem.isLocalMessage && (
                                            <TableCell align="right" style={{ paddingBottom: 0, paddingTop: 0 }}>
                                                <div
                                                    style={{
                                                        paddingLeft: '10px',
                                                        color: 'blue',
                                                        borderRadius: '5px'
                                                    }}
                                                >
                                                    {conversationItem.message}
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TableContainer component={Paper}>
                        <Table style={{ border: '0px solid black' }} size="small" aria-label="a dense table">
                            <TableBody sx={{ border: 1 }}>
                                <TableRow sx={{ border: 0, background: 'grey' }}>
                                    <TableCell>
                                        <TextField
                                            id="message"
                                            label="Message"
                                            multiline
                                            maxRows={4}
                                            value={message}
                                            fullWidth
                                            disabled={disabled}
                                            onChange={this.onMessageTextChanged}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            variant="contained"
                                            disabled={disabled}
                                            onClick={this.onSendClicked}
                                            color="primary">
                                            Send
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TableContainer component={Paper}>
                        <Table className={'TurkeeStatusBar'} style={{ border: '1px solid black', backgroundColor: '#3333' }} size="small" aria-label="a dense table">
                            <TableBody sx={{ border: 1 }}>
                                <TableRow sx={{ border: 0, background: 'grey' }}>
                                    <TableCell>
                                        <div style={{ color: 'black' }}>{statusLeftString}</div>
                                    </TableCell>
                                    <TableCell align="center">
                                        <div style={{ color: 'black' }}>{statusCenterString}</div>
                                    </TableCell>                                    
                                    <TableCell align="right">
                                        <div style={{ color: 'black' }}>{statusRightString}</div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                </div>
            );

        } catch (error) {
            return (
                <>
                    <b>"{error.message}"</b>
                </>
            );
        }
    }

}

export default withStyles(styles)(Chat);
