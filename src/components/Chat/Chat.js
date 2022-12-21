// @flow
import * as React from 'react';
import {
  Table, TableBody, Button,
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
      playerProps: this.props.playerProps,
      chatInfo: this.props.chatInfo,
      isModerated: null,
      isModerator: this.props.moderatorInfo ? true : false
    };

    this.connection = this.props.connection;

    // Binding this keyword  
    this.onMessageTextChanged = this.onMessageTextChanged.bind(this);
    this.onSendClicked = this.onSendClicked.bind(this);
    this.onChatCommandCallback = this.onChatCommandCallback.bind(this);
    this.onMessageCallback = this.onMessageCallback.bind(this);
    this.onSystemMessageCallback = this.onSystemMessageCallback.bind(this);
    this.onRoomAssigned = this.onRoomAssigned.bind(this);
    this.onAtriumAssigned = this.onAtriumAssigned.bind(this);
    this.onRemoteDisconnected = this.onRemoteDisconnected.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);

    var self = this;
    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { self.onChatCommandCallback(payload) });
    this.connection.on(constants.SIGNALMETHOD_MESSAGE, (payload) => { self.onMessageCallback(payload) });
    this.connection.on(constants.SIGNALMETHOD_SYSTEM_MESSAGE, (payload) => { self.onSystemMessageCallback(payload) });

    this.messageRef = React.createRef();

    log.debug(`Chat component initialized.  group = '${this.props.chatInfo.GroupName}'`);
  }

  // command method listener
  onChatCommandCallback(payload) {

    log.debug(`onChatCommandCallback: ${payload.command}, ${JSON.stringify(payload.data, null, 2)}`);

    if (payload.command === constants.SIGNALCMD_ATRIUMASSIGNED) {
      this.onAtriumAssigned(payload);
    }

    else if (payload.command === constants.SIGNALCMD_TURKER_DISCONNECTED) {
      this.onRemoteDisconnected(payload);
    }

    else if (payload.command === constants.SIGNALCMD_ROOMASSIGNED) {
      this.onRoomAssigned(payload.data);
    }

    else {
      log.debug(`onChatCommandCallback unknown command: '${payload.command}'`);
    }    

  }
  
  onRoomAssigned(payload) {

    log.info(`onRoomAssigned (${JSON.stringify(payload, null, 1)})`);

    const { isModerator } = this.state;

    this.setState({ chatInfo: payload, isModerated: true });

    const { chatInfo } = this.state;

    this.onSystemMessageCallback({
      recipientGroupName: chatInfo.commandChannel,
      data: isModerator ? `Learner Connected ${chatInfo.commandChannel}` : `Moderator Connected ${chatInfo.commandChannel}`
    });    
  }

  onRemoteDisconnected(payload) {

    const { isModerator, chatInfo } = this.state;

    this.onSystemMessageCallback({
      recipientGroupName: chatInfo.commandChannel,
      data: isModerator ? "Learner Disconnected" : "Moderator Disconnected"
    });

    this.setState({ isModerated: false });

  }

  // chat participant has been assigned to a room atrium
  onAtriumAssigned(payload) {

    log.info(`onAtriumAssigned (${JSON.stringify(payload, null, 1)})`);

    const { chatInfo } = this.state;
    this.onSystemMessageCallback({
      recipientGroupName: chatInfo.commandChannel,
      data: "Waiting for Room"
    });
  }

  // system message method listener
  onSystemMessageCallback(payload) {

    try {
      payload.isSystemMessage = true;
      this.onMessageCallback(payload);
    } catch (error) {
      log.error(`onSystemMessage exception: ${error.message}`);
    }

  }

  // chat message method listener
  onMessageCallback(payload) {

    try {

      log.info(`onMessage (${JSON.stringify(payload, null, 1)})`);

      const { 
        conversation, 
        chatInfo 
      } = this.state;

      // ensure the message was for this learner
      if (payload.recipientGroupName !== chatInfo.commandChannel) {
        return;
      }

      // tri-ary flag: 
      //  true = local message (echo), 
      //  false = remote message
      //  null - system message
      let isLocal = null;

      // if not system message, determine locality
      // of message
      if (!payload.isSystemMessage) {
        // test if this is a moderator-hosted component
        if (this.props.moderatorInfo) {
          log.info(`moderator msg locality: ('${this.props.moderatorInfo.userId}' == '${payload.from}'?)`);
          isLocal = this.props.moderatorInfo.userId == payload.from;
        }
        else {
          log.info(`learner msg locality: ('${chatInfo.userId}' == '${payload.from}'?)`);
          isLocal = chatInfo.userId == payload.from;
        }
      }

      conversation.push(this.createData(conversation.length, payload.data, isLocal));

      if (this.props.onMessageReceived) {
        this.props.onMessageReceived(payload);
      }

      this.setState({ conversation: conversation });

      this.scrollToBottom();

    } catch (error) {
      log.error(`onMessage exception: ${error.message}`);
    }

  }

  onSendClicked = (event) => {

    try {

      const { message, chatInfo } = this.state;
      const { connectionId } = chatInfo;

      if (message.length > 0) {

        let from = {};

        // if component has moderator, then reflect
        // that in the message sender        
        if (this.props.moderatorInfo) {
          from = Object.assign({}, this.props.moderatorInfo);
        }
        else {
          from = chatInfo;
        }

        const messagePayload = {
          envelope: {
            to: chatInfo.commandChannel,
            from: from
          },
          Data: message
        };

        log.debug(`onSendClicked: ${JSON.stringify(messagePayload, null, 2)}]`);

        this.connection.send(constants.SIGNALMETHOD_MESSAGE, messagePayload);
      }

      // clear out sent messages
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

  onMessageKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.onSendClicked(null);
      event.preventDefault();
    }
  }

  onMessageTextChanged = (event) => {
    let message = this.state.message;

    this.setState(state => {
      message = event.target.value;
      return ({ message });
    });
    event.preventDefault();
  }

  scrollToBottom = () => {
    let t = this.messageRef;
    this.messageRef.current.scrollTop = this.messageRef.current.scrollHeight;
  }

  render() {

    let {
      conversation,
      maxHeight,
      message,
      width,
      isModerated,
      isModerator,
      chatInfo
    } = this.state;

    const divLayout = { width: width, border: '2px solid black', backgroundColor: '#3333' };
    const tableContainerStyle = { height: '100%', maxHeight: maxHeight };

    // disable entry if:
    //  1) not have a group name assigned
    //  2) not connected to hub
    const disabled = (
      (chatInfo.commandChannel === '') ||
      !this.connection.connectionId ||
      !isModerated
    );

    try {

      return (
        <div name="chat" style={divLayout}>
          <TableContainer ref={this.messageRef} name="conversation" component={Paper} style={tableContainerStyle}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b></b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {conversation.map((conversationItem) => (
                  <TableRow style={{ bottomBorder: '0px' }} key={conversationItem.key}>
                    {(conversationItem.isLocalMessage == null) && (
                      <TableCell style={{ borderBottom: "none" }} align="center">
                        <span
                          style={{
                            border: 'none',
                            backgroundColor: 'grey',
                            color: 'white',
                            borderRadius: '25px',
                            fontSize: '16px',
                            padding: '10px'
                          }}
                        >
                          {conversationItem.message}
                        </span>
                      </TableCell>
                    )}
                    {(conversationItem.isLocalMessage === true) && (
                      <TableCell style={{ borderBottom: "none" }} align="left">
                        <b>You::&nbsp;</b>
                        <span
                          style={{
                            border: 'none',
                            backgroundColor: 'blue',
                            color: 'white',
                            borderRadius: '25px',
                            fontSize: '16px',
                            padding: '10px'
                          }}
                        >
                          {conversationItem.message}
                        </span>
                      </TableCell>
                    )}
                    {(conversationItem.isLocalMessage === false) && (
                      <TableCell style={{ borderBottom: "none" }} align="right">
                        <b>Moderator:&nbsp;</b>
                        <span
                          style={{
                            border: 'none',
                            backgroundColor: 'green',
                            color: 'white',
                            borderRadius: '25px',
                            fontSize: '16px',
                            padding: '10px'
                          }}
                        >
                          {conversationItem.message}
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TableContainer name="textentry" component={Paper}>
            <Table size="small" aria-label="a dense table">
              <TableBody>
                <TableRow sx={{ background: 'grey' }}>
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
                      onKeyDown={this.onMessageKeyDown}
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
