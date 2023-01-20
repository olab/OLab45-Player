// @flow
import * as React from 'react';
import {
  Table, TableBody, Button,
  TableCell, Paper, TableContainer,
  TableHead, TableRow, TextField, Tooltip,
  Select, Menu, MenuItem, FormLabel
} from '@material-ui/core';
import log from 'loglevel';
import { withStyles } from '@material-ui/core/styles';
import styles from '../WikiTags/styles.module.css';
import { HubConnectionState } from '@microsoft/signalr';

import SendIcon from '@material-ui/icons/Send';
import ClearIcon from '@material-ui/icons/Clear';
import CheckIcon from '@material-ui/icons/Check';
import CancelIcon from '@material-ui/icons/Cancel';
import CancelPresentationIcon from '@material-ui/icons/CancelPresentation';
import BlockIcon from '@material-ui/icons/Block';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import SlotInfo from '../../helpers/SlotInfo';

var constants = require('../../services/constants');

class Chat extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      conversation: [],
      message: '',
      inMacroMode: false,
      mapNodes: [],
      inJumpNodeMode: false,
      selectedNode: {},
      selectedNodeId: '0',
      ...this.props
    };

    this.index = this.props.localInfo.key;
    this.connection = this.props.connection;
    this.connectionId = this.props.connection.connectionId?.slice(-3);

    // Binding this keyword  
    this.onMessageTextChanged = this.onMessageTextChanged.bind(this);
    this.onClickSendMessage = this.onClickSendMessage.bind(this);
    this.onCommand = this.onCommand.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onSystemMessage = this.onSystemMessage.bind(this);
    this.onClickEnableSendToNodeMode = this.onClickEnableSendToNodeMode.bind(this);
    this.onSelectNode = this.onSelectNode.bind(this);

    this.onLearnerAssigned = this.onParticipantAssigned.bind(this);
    this.onModeratorAssigned = this.onModeratorAssigned.bind(this);
    this.onAtriumAssigned = this.onAtriumAssigned.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);

    var chatSelf = this;
    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { chatSelf.onCommand(payload) });
    this.connection.on(constants.SIGNALMETHOD_MESSAGE, (payload) => { chatSelf.onMessage(payload) });
    this.connection.on(constants.SIGNALMETHOD_SYSTEM_MESSAGE, (payload) => { chatSelf.onSystemMessage(payload) });

    log.debug(`Chat[${this.index}] ctor`);

    this.messageRef = React.createRef();
  }

  componentDidUpdate(prevProps) {

    if (prevProps.show !== this.props.show) {
      this.setState({ show: this.props.show });
    }

    if (prevProps.localInfo !== this.props.localInfo) {
      this.setState({ localInfo: this.props.localInfo });
    }

    if (prevProps.senderInfo !== this.props.senderInfo) {
      this.setState({ senderInfo: this.props.senderInfo });
    }

  }

  // command method listener
  onCommand(payload) {

    try {
      let { isModerator, localInfo, senderInfo } = this.state;

      if (payload.command === constants.SIGNALCMD_ATRIUMASSIGNED) {
        log.debug(`'onCommand[${this.index}] CMD: ${payload.command} CH: ${payload?.commandChannel} M:${isModerator} LOCAL: ${localInfo?.userId} -> REM: ${senderInfo?.userId}`);
        this.onAtriumAssigned(payload);
      }

      if (payload.command === constants.SIGNALCMD_TURKER_ASSIGNED) {
        log.debug(`'onCommand[${this.index}] CMD: ${payload.command} CH: ${payload?.commandChannel} M:${isModerator} LOCAL: ${localInfo?.userId} -> REM: ${senderInfo?.userId}`);
        this.onModeratorAssigned(payload.data);
      }

      else if (payload.command === constants.SIGNALCMD_ROOMASSIGNED) {
        log.debug(`'onCommand[${this.index}] CMD: ${payload.command} CH: ${payload?.commandChannel} M:${isModerator} LOCAL: ${localInfo?.userId} -> REM: ${senderInfo?.userId}`);
        this.onParticipantAssigned(payload);
      }

      else if (payload.command === constants.SIGNALCMD_LEARNER_UNASSIGNED) {
        log.debug(`'onCommand[${this.index}] CMD: ${payload.command} CH: ${payload?.commandChannel} M:${isModerator} LOCAL: ${localInfo?.userId} -> REM: ${senderInfo?.userId}`);
        this.onLearnerUnassigned(payload);
      }

      else if (payload.command === constants.SIGNALCMD_TURKER_DISCONNECTED) {
        log.debug(`'onCommand[${this.index}] CMD: ${payload.command} CH: ${payload?.commandChannel} M:${isModerator} LOCAL: ${localInfo?.userId} -> REM: ${senderInfo?.userId}`);
        this.onModeratorUnassigned(payload.data);
      }

      // else {
      //   log.debug(`'${localInfo?.connectionId}' onCommand ignoring command: '${payload.command}'`);
      // }

    } catch (error) {
      log.error(`onCommand[${this.index}] exception: ${error.message}`);
    }

  }

  onModeratorAssigned(payload) {

    try {

      this.setState({
        mapNodes: payload.mapNodes
      });

    } catch (error) {
      log.error(`onModeratorAssigned[${this.index}] exception: ${error.message}`);
    }

  }

  // chat participant has been assigned to a room atrium,
  // so paint a message to the chat window
  onAtriumAssigned(payload) {

    try {

      let { localInfo, isModerator } = this.state;

      log.info(`'onAtriumAssigned[${this.index}] (${JSON.stringify(payload, null, 1)})`);

      // only learners (non-moderators) get this waiting message
      if (!isModerator) {
        this.onSystemMessage({
          commandChannel: localInfo.commandChannel,
          data: "Waiting to be admitted"
        });
      }

    } catch (error) {
      log.error(`onAtriumAssigned[${this.index}] exception: ${error.message}`);
    }
  }

  // participant has been assigned to a room,
  // so paint a message to the chat window  
  onParticipantAssigned(payload) {

    try {

      let { isModerator, localInfo } = this.state;
      let remoteInfo = {};
      let session = {};

      log.info(`'onParticipantAssigned[${this.index}] (${JSON.stringify(payload, null, 1)})`);

      if (isModerator) {
        remoteInfo = new SlotInfo(payload.data.local);
        // get the (learner) session info from the payload
        session = payload.data.local.session;
      }
      else {
        remoteInfo = new SlotInfo(payload.data.remote);
        // there should already be session info in the state
        session = localInfo.session;
      }

      this.setState({
        // senderInfo: remoteInfo,
        session: session
      });

      this.onSystemMessage({
        commandChannel: payload.data.local.commandChannel,
        data: isModerator ?
          `'${payload.data.local.nickName}' connected` :
          `Connected. You are talking to '${payload.data.remote.nickName}'`
      });

    } catch (error) {
      log.error(`onParticipantAssigned[${this.index}] exception: ${error.message}`);
    }
  }

  onModeratorUnassigned(payload) {

  }

  onLearnerUnassigned(payload) {

    try {

      let { isModerator, localInfo, senderInfo } = this.state;

      // gatekeep if this chat instance has no learner assigned
      if (isModerator && !senderInfo?.userId) {
        return;
      }

      // ensure the message was for this chat box
      if (payload.commandChannel !== localInfo.commandChannel) {
        log.info(`'${localInfo.connectionId}' onLearnerUnassigned message not for '${localInfo.commandChannel}'`);
        return;
      }

      localInfo.assigned = false;

      this.setState({ localInfo: localInfo });

      this.onSystemMessage({
        commandChannel: localInfo?.commandChannel,
        data: `'${payload.data.nickName}' has disconnected`
      });

    } catch (error) {
      log.error(`onLearnerUnassigned[${this.index}] exception: ${error.message}`);
    }
  }

  // system message method listener
  onSystemMessage(payload) {

    try {

      let { localInfo } = this.state;

      log.info(`'onSystemMessage[${this.index}] (${JSON.stringify(payload, null, 1)})`);

      payload.isSystemMessage = true;
      this.onMessage(payload);

    } catch (error) {
      log.error(`onSystemMessage[${this.index}] exception: ${error.message}`);
    }

  }

  // chat message method listener
  onMessage(payload) {

    try {

      const {
        conversation,
        localInfo,
        senderInfo
      } = this.state;

      log.info(`'onMessage[${this.index}] (${JSON.stringify(payload, null, 1)})`);

      // ensure the message was for this chat box
      if (payload.commandChannel !== localInfo.commandChannel) {
        log.info(`'${localInfo.connectionId}' onMessage message not for '${localInfo.commandChannel}'`);
        return;
      }

      log.info(`'${localInfo.connectionId}' onMessage message for '${localInfo.commandChannel}'`);

      // tri-ary flag: 
      //  true = locally initiated message (echo), 
      //  false = remotely initiated message
      //  null - system message
      let isLocal = null;

      // if not system message, determine locality
      // of message
      if (!payload.isSystemMessage) {
        log.info(`'${localInfo.connectionId}' system message.  testing message direction: ('${senderInfo.userId}' == '${payload.from}'?)`);
        isLocal = localInfo.userId == payload.from;
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
      log.error(`onMessage[${this.index}] exception: ${error.message}`);
    }

  }

  onClickJumpNode = (event) => {

    try {

      let { senderInfo, session, selectedNode } = this.state;

      const payload = {
        envelope: {
          to: senderInfo.commandChannel,
          from: senderInfo
        },
        session: session,
        data: {
          mapId: session.mapId,
          nodeId: selectedNode.id,
          nodeName: selectedNode.name
        }
      };

      log.info(`'onClickJumpNode[${this.index}] (${JSON.stringify(payload, null, 1)})`);

      this.connection.send(constants.SIGNALCMD_JUMP_NODE, payload);

      this.setState({ inJumpNodeMode: false });

    } catch (error) {
      log.error(`onClickJumpNode[${this.index}] exception: ${error.message}`);
    }
  }

  onClickEnableSendToNodeMode = (event) => {
    this.setState({ inJumpNodeMode: true });
  }

  onClickCancelSendToNodeMode = (event) => {
    this.setState({ inJumpNodeMode: false });
  }

  onSelectNode(event) {

    try {

      let { selectedNodeId, selectedNode, mapNodes } = this.state;

      // test for valid turkee selected from available list
      if (event.target.value !== '0') {

        log.info(`'onSelectNode[${this.index}] (${event.target.value})`);

        // find learner in atrium list
        for (let item of mapNodes) {
          if (item.id === event.target.value) {
            selectedNode = item;
            selectedNodeId = `${item.id}`;
            break;
          }
        }

        this.setState({ selectedNode, selectedNodeId });
      }

    } catch (error) {
      log.error(`onSelectNode[${this.index}] exception: ${error.message}`);
    }

  }

  onClickClear = (event) => {

    let { localInfo } = this.state;

    this.setState({ conversation: [] });

    this.onSystemMessage({
      commandChannel: localInfo.commandChannel,
      data: `'Conversation cleared`
    });
  }

  onClickSendMessage = (event) => {

    try {

      const { message, senderInfo, localInfo, session } = this.state;

      if (message.length > 0) {

        const messagePayload = {
          envelope: {
            to: localInfo.commandChannel,
            from: localInfo
          },
          session: session,
          Data: message
        };

        log.info(`'onSendClicked[${this.index}] (${JSON.stringify(messagePayload, null, 1)})`);

        this.connection.send(constants.SIGNALMETHOD_MESSAGE, messagePayload);
      }

      // clear out sent messages
      this.setState({ message: '' });

    } catch (error) {
      log.error(`onSendClicked[${this.index}] exception: ${error.message}`);
    }

  }

  createData(key, message, isLocalMessage) {
    return { key, message, isLocalMessage };
  }

  evaluateMacro() {

    try {
      let { message, localInfo, senderInfo } = this.state;

      // put space char back on end so regex can match it
      message += ' ';

      const macroRegEx = /\~.*\s/gm;
      let replaceString = '';

      // extract macro name
      let macro = macroRegEx.exec(message)[0].replace('~', '');
      macro = macro.replace(' ', '');

      switch (macro) {
        case 'n':
          replaceString = senderInfo.nickName;
          break;
        case 'u':
          replaceString = senderInfo.userId;
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
      log.error(`evaluateMacro[${this.index}] exception: ${error.message}`);
    }

  }

  onMessageKeyDown = (event) => {

    let { inMacroMode, message, localInfo } = this.state;

    if (event.key === 'Enter') {
      this.onClickSendMessage(null);
      event.preventDefault();
    }

    else if (event.key === '~') {
      this.setState({ inMacroMode: true });
      log.info(`'onMessageKeyDown[${this.index}] entering macro mode`);
    }

    else if ((event.key === " ") && inMacroMode) {
      log.info(`'onMessageKeyDown[${this.index}] evaluating macro ${message}`);
      
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
    try {
      let t = this.messageRef;
      this.messageRef.current.scrollTop = this.messageRef.current?.scrollHeight;
    } catch (error) {

    }
  }

  render() {

    let {
      conversation,
      maxHeight,
      message,
      width,
      isModerator,
      localInfo,
      senderInfo,
      show,
      mapNodes,
      inJumpNodeMode,
      selectedNodeId
    } = this.state;

    if (!show) {
      return null;
    }

    const divLayout = { width: '100%', border: '2px solid black', backgroundColor: '#3333' };
    const tableContainerStyle = { maxHeight: 300 };
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
              <TableBody>
                {conversation.map((conversationItem) => (
                  <TableRow name="convrow" style={{ bottomBorder: '0px' }} key={conversationItem.key}>
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

                        <Table stickyHeader size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell style={{ width: '10%' }}>
                                <b>You</b>
                              </TableCell>
                              <TableCell align="left" style={{ borderRadius: '25px', backgroundColor: 'blue' }}>
                                <span
                                  style={{
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '16px',
                                    padding: '10px',
                                    lineHeight: '1.8'
                                  }}
                                >
                                  {conversationItem.message}
                                </span>
                              </TableCell>
                              <TableCell style={{ width: '15%' }}>
                                <b>&nbsp;</b>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableCell>
                    )}
                    {(conversationItem.isLocalMessage === false) && (
                      <TableCell style={{ borderBottom: "none" }}>

                        <Table stickyHeader size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell style={{ width: '15%' }}>
                                <b>&nbsp;</b>
                              </TableCell>
                              <TableCell align="left" style={{ borderRadius: '25px', backgroundColor: 'green' }}>
                                <span
                                  style={{
                                    border: 'none',
                                    backgroundColor: 'green',
                                    color: 'white',
                                    fontSize: '16px',
                                    padding: '10px',
                                    lineHeight: '1.8'
                                  }}
                                >
                                  {conversationItem.message}
                                </span>
                              </TableCell>
                              <TableCell style={{ width: '10%' }}>
                                <b>{!isModerator ? "Moderator" : "Them"}&nbsp;</b>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
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
                  <TableCell style={{ width: '80%' }} >
                    {(!inJumpNodeMode && (
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
                      />)
                    )}
                    {(inJumpNodeMode && (
                      <>
                        <FormLabel>Send participant to:</FormLabel>
                        <Select
                          value={selectedNodeId}
                          onChange={this.onSelectNode}
                          style={{ width: '100%' }}
                        >
                          <MenuItem key="0" value="0">
                            <em>--Select--</em>
                          </MenuItem>
                          {mapNodes.map((item) => (
                            <MenuItem
                              key={item.id}
                              value={item.id}>
                              {item.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </>)
                    )}

                  </TableCell>
                  <TableCell align="right">
                    {
                      inJumpNodeMode && (
                        <>
                          <Tooltip title="Cancel" placement="top">
                            <span>
                              <Button
                                variant="contained"
                                disabled={disabled}
                                onClick={this.onClickCancelSendToNodeMode}
                                color="secondary">
                                <CancelIcon />
                              </Button>
                            </span>
                          </Tooltip>
                          <Tooltip title="Send To Node" placement="top">
                            <span>
                              <Button
                                variant="contained"
                                disabled={disabled}
                                onClick={this.onClickJumpNode}
                                color="primary">
                                <ExitToAppIcon />
                              </Button>
                            </span>
                          </Tooltip>

                        </>
                      )}
                    {!inJumpNodeMode && isModerator && (
                      <>
                        <Tooltip title="Enter Node Selection Mode" placement="top">
                          <span>
                            <Button
                              variant="contained"
                              disabled={disabled}
                              onClick={this.onClickEnableSendToNodeMode}
                              color="primary">
                              <ExitToAppIcon />
                            </Button>
                          </span>
                        </Tooltip>
                      </>
                    )}
                    {!inJumpNodeMode && (
                      <Tooltip title="Send" placement="top">
                        <span>
                          <Button
                            variant="contained"
                            disabled={disabled}
                            onClick={this.onClickSendMessage}
                            color="primary">
                            <SendIcon />
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

        </div >
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