// @flow
import * as React from 'react';
import {
  Table, TableBody, Button,
  TableCell, Paper, TableContainer,
  TableHead, TableRow, TextField, Tooltip
} from '@material-ui/core';
import log from 'loglevel';
import { withStyles } from '@material-ui/core/styles';
import styles from '../styles.module.css';
import { HubConnectionState } from '@microsoft/signalr';
var constants = require('../../../services/constants');

import SendIcon from '@material-ui/icons/Send';
import ClearIcon from '@material-ui/icons/Clear';
import CancelPresentationIcon from '@material-ui/icons/CancelPresentation';
import BlockIcon from '@material-ui/icons/Block';

class Chat extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      localInfo: this.props.localInfo,
      senderInfo: this.props.senderInfo,
      conversation: [],
      playerProps: this.props.playerProps,
      message: '',
      isModerator: this.props.isModerator,
      inMacroMode: false
    };

    this.connection = this.props.connection;

    // Binding this keyword  
    this.onMessageTextChanged = this.onMessageTextChanged.bind(this);
    this.onSendClicked = this.onSendClicked.bind(this);
    this.onCommandCallback = this.onCommandCallback.bind(this);
    this.onMessageCallback = this.onMessageCallback.bind(this);
    this.onSystemMessageCallback = this.onSystemMessageCallback.bind(this);
    this.onLearnerAssigned = this.onParticipantAssigned.bind(this);
    this.onAtriumAssigned = this.onAtriumAssigned.bind(this);
    // this.onRemoteDisconnected = this.onRemoteDisconnected.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);

    var self = this;
    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { self.onCommandCallback(payload) });
    this.connection.on(constants.SIGNALMETHOD_MESSAGE, (payload) => { self.onMessageCallback(payload) });
    this.connection.on(constants.SIGNALMETHOD_SYSTEM_MESSAGE, (payload) => { self.onSystemMessageCallback(payload) });

    this.messageRef = React.createRef();

    log.debug(`Chat component initialized.  group = '${this.props.localInfo?.roomName}'`);
  }

  // command method listener
  onCommandCallback(payload) {

    log.debug(`onChatCommandCallback: ${payload.command}`);

    if (payload.command === constants.SIGNALCMD_ATRIUMASSIGNED) {
      this.onAtriumAssigned(payload);
    }

    else if (payload.command === constants.SIGNALCMD_ROOMASSIGNED) {
      this.onParticipantAssigned(payload.data);
    }

    else if (payload.command === constants.SIGNALCMD_LEARNER_UNASSIGNED) {
      this.onLearnerUnassigned(payload.data);
    }

    else {
      log.debug(`onChatCommandCallback ignoring command: '${payload.command}'`);
    }

  }

  // chat participant has been assigned to a room atrium,
  // so paint a message to the chat window
  onAtriumAssigned(payload) {

    log.info(`onAtriumAssigned (${JSON.stringify(payload, null, 1)})`);

    let { localInfo } = this.state;

    this.onSystemMessageCallback({
      recipientGroupName: localInfo.commandChannel,
      data: "Waiting for Room"
    });
  }

  // participant has been assigned to a room,
  // so paint a message to the chat window  
  onParticipantAssigned(payload) {

    log.info(`onParticipantAssigned (${JSON.stringify(payload, null, 1)})`);

    let { isModerator } = this.state;

    this.onSystemMessageCallback({
      recipientGroupName: payload.local.commandChannel,
      data: isModerator ?
        `'${payload.local.nickName}' connected to room` :
        `Connected to room. Moderator is '${payload.remote.nickName}'`
    });
  }

  onLearnerUnassigned(payload) {

    log.info(`onLearnerUnassigned (${JSON.stringify(payload, null, 1)})`);

    let { localInfo } = this.state;

    this.onSystemMessageCallback({
      recipientGroupName: payload.commandChannel,
      data: `'${payload.nickName}' has left the room`
    });
  }

  // onRemoteDisconnected(payload) {

  //   log.info(`onRemoteDisconnected (${JSON.stringify(payload, null, 1)})`);

  //   let { localInfo } = this.state;
  //   localInfo.isAssigned = false;
  //   this.setState( { localInfo: localInfo });

  //   this.onSystemMessageCallback({
  //     recipientGroupName: chatInfo.commandChannel,
  //     data: "Disconnected"
  //   });

  // }

  // system message method listener
  onSystemMessageCallback(payload) {

    try {

      log.info(`onSystemMessageCallback (${JSON.stringify(payload, null, 1)})`);

      payload.isSystemMessage = true;
      this.onMessageCallback(payload);
    } catch (error) {
      log.error(`onSystemMessage exception: ${error.message}`);
    }

  }

  // chat message method listener
  onMessageCallback(payload) {

    try {

      const {
        conversation,
        localInfo,
        senderInfo
      } = this.state;

      log.info(`onMessage (${JSON.stringify(payload, null, 1)})`);

      // ensure the message was for this chat box
      if (payload.recipientGroupName !== localInfo.commandChannel) {
        log.info(`onMessage: message not for '${localInfo.commandChannel}'`);
        return;
      }

      log.info(`onMessage: message for '${localInfo.commandChannel}'`);

      // tri-ary flag: 
      //  true = locally initiated message (echo), 
      //  false = remotely initiated message
      //  null - system message
      let isLocal = null;

      // if not system message, determine locality
      // of message
      if (!payload.isSystemMessage) {
        log.info(`system message.  testing message direction: ('${senderInfo.userId}' == '${payload.from}'?)`);
        isLocal = senderInfo.userId == payload.from;
      }
      else {

        // 'normal' message, so we can signal 
        // parent component of new message
        if (this.props.onMessageReceived) {
          this.props.onMessageReceived(payload);
        }

      }

      conversation.push(this.createData(conversation.length, payload.data, isLocal));

      this.setState({ conversation: conversation });
      this.scrollToBottom();

    } catch (error) {
      log.error(`onMessage exception: ${error.message}`);
    }

  }

  onSendClicked = (event) => {

    try {

      const { message, senderInfo, localInfo } = this.state;

      if (message.length > 0) {

        const messagePayload = {
          envelope: {
            to: localInfo.commandChannel,
            from: senderInfo
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

  evaluateMacro() {

    try {
      let { message, localInfo } = this.state;

      // put space char back on end so regex can match it
      message += ' ';

      const macroRegEx = /\~.*\s/gm;
      let replaceString = '';

      // extract macro name
      let macro = macroRegEx.exec(message)[0].replace('~', '');
      macro = macro.replace(' ', '');

      switch (macro) {
        case 'm':
          replaceString = localInfo.nickName;
          break;
        case 'u':
          replaceString = localInfo.userId;
          break;
        case 'greet':
          replaceString = 'Hello there, how are you?';
          break;
        default:
          break;
      }

      // do the string replacement
      let newMsg = message.replace(macroRegEx, replaceString);
      newMsg += ' ';

      this.setState({ message: newMsg });

    } catch (error) {
      log.error(`evaluateMacro exception: ${error.message}`);
    }

  }

  onMessageKeyDown = (event) => {

    let { inMacroMode, message } = this.state;

    if (event.key === 'Enter') {
      this.onSendClicked(null);
      event.preventDefault();
    }

    else if (event.key === '~') {
      this.setState({ inMacroMode: true });
      log.debug(`entering macro mode`);
    }

    else if ((event.key === " ") && inMacroMode) {
      log.debug(`evaluating macro ${message}`);
      this.setState({ inMacroMode: false });
      this.evaluateMacro();
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
    this.messageRef.current.scrollTop = this.messageRef.current?.scrollHeight;
  }

  render() {

    let {
      conversation,
      maxHeight,
      message,
      width,
      isModerator,
      localInfo
    } = this.state;

    const divLayout = { width: '100%', border: '2px solid black', backgroundColor: '#3333' };
    const tableContainerStyle = { maxHeight: 200 };
    let disabled = true;

    // disable entry if:
    //  1) not assigned in room
    //  2) not connected to hub
    disabled = (
      !localInfo.assigned ||
      !this.props.connection.connectionId
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
                            fontSize: '14px',
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
                    {(isModerator) && (
                      <>
                        <Tooltip title="Disconnect" placement="top">
                          <Button
                            variant="contained"
                            disabled={disabled}
                            onClick={this.onSendClicked}
                            color="secondary">
                            <CancelPresentationIcon/>
                          </Button>
                        </Tooltip>
                        <Tooltip title="Clear" placement="top">
                          <Button
                            variant="contained"
                            disabled={disabled}
                            onClick={this.onSendClicked}
                            color="primary">
                            <ClearIcon />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Send" placement="top">
                      <Button
                        variant="contained"
                        disabled={disabled}
                        onClick={this.onSendClicked}
                        color="primary">
                        <SendIcon />
                      </Button>
                    </Tooltip>

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
