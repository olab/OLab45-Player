// @flow
import * as React from 'react';
import {
  Table, TableBody, Button,
  TableCell, Paper, TableContainer,
  TableHead, TableRow, TextField, Tooltip,
  Select, Menu, MenuItem, FormLabel
} from '@material-ui/core';
import { Log, LogInfo, LogError, LogException } from '../../utils/Logger';
import log from 'loglevel';
import { withStyles } from '@material-ui/core/styles';
import styles from '../WikiTags/styles.module.css';
import { checkText } from 'smile2emoji'
import SendIcon from '@material-ui/icons/Send';
import CancelIcon from '@material-ui/icons/Cancel';
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

    log.debug(`Chat[${this.props.index}] ctor`);

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
        log.debug(`'onCommand[${this.props.index}] CMD: ${payload.command} CH: ${payload?.commandChannel} M:${isModerator} LOCAL: ${localInfo?.userId} -> REM: ${senderInfo?.userId}`);
        this.onAtriumAssigned(payload);
      }

      if (payload.command === constants.SIGNALCMD_TURKER_ASSIGNED) {
        log.debug(`'onCommand[${this.props.index}] CMD: ${payload.command} CH: ${payload?.commandChannel} M:${isModerator} LOCAL: ${localInfo?.userId} -> REM: ${senderInfo?.userId}`);
        this.onModeratorAssigned(payload.data);
      }

      else if (payload.command === constants.SIGNALCMD_ROOMASSIGNED) {
        log.debug(`'onCommand[${this.props.index}] CMD: ${payload.command} CH: ${payload?.commandChannel} M:${isModerator} LOCAL: ${localInfo?.userId} -> REM: ${senderInfo?.userId}`);
        this.onParticipantAssigned(payload);
      }

      else if (payload.command === constants.SIGNALCMD_LEARNER_UNASSIGNED) {
        log.debug(`'onCommand[${this.props.index}] CMD: ${payload.command} CH: ${payload?.commandChannel} M:${isModerator} LOCAL: ${localInfo?.userId} -> REM: ${senderInfo?.userId}`);
        this.onParticipantUnassigned(payload);
      }

      else if (payload.command === constants.SIGNALCMD_TURKER_DISCONNECTED) {
        log.debug(`'onCommand[${this.props.index}] CMD: ${payload.command} CH: ${payload?.commandChannel} M:${isModerator} LOCAL: ${localInfo?.userId} -> REM: ${senderInfo?.userId}`);
        this.onModeratorUnassigned(payload.data);
      }

    } catch (error) {
      LogError(`onCommand[${this.props.index}] exception: ${error.message}`);
    }

  }

  onModeratorAssigned(payload) {

    try {

      this.setState({
        mapNodes: payload.mapNodes
      });

    } catch (error) {
      LogError(`onModeratorAssigned[${this.props.index}] exception: ${error.message}`);
    }

  }

  // chat participant has been assigned to a room atrium,
  // so paint a message to the chat window
  onAtriumAssigned(payload) {

    try {

      let { localInfo, isModerator } = this.state;

      LogInfo(`'onAtriumAssigned[${this.props.index}] (${JSON.stringify(payload, null, 1)})`);

      // only learners (non-moderators) get this waiting message
      if (!isModerator) {
        this.onSystemMessage({
          commandChannel: localInfo.commandChannel,
          data: "Waiting to be admitted"
        });
      }

    } catch (error) {
      LogError(`onAtriumAssigned[${this.props.index}] exception: ${error.message}`);
    }
  }

  // participant has been assigned to a room,
  // so paint a message to the chat window  
  onParticipantAssigned(payload) {

    try {

      let { isModerator, localInfo, index } = this.state;
      let remoteInfo = {};
      let session = {};

      // test if assignment is for this cell (moderators only,
      // since routing to a specific chat is required)
      if ( isModerator && ( payload.data.slotIndex != index ) ) {
        return;        
      }

      LogInfo(`'onParticipantAssigned[${this.props.index}] (${JSON.stringify(payload, null, 1)})`);

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
      LogError(`onParticipantAssigned[${this.props.index}] exception: ${error.message}`);
    }
  }

  onModeratorUnassigned(payload) {

  }

  onParticipantUnassigned(payload) {

    try {

      let { isModerator, localInfo, senderInfo, index } = this.state;

      // test if assignment is for this cell (moderators only,
      // since routing to a specific chat is required)
      if ( isModerator && ( payload.data.slotIndex != index ) ) {
        return;        
      }

      // gatekeep if this chat instance has no learner assigned
      if (isModerator && !senderInfo?.userId) {
        return;
      }

      LogInfo(`'onParticipantUnassigned[${this.props.index}] (${JSON.stringify(payload, null, 1)})`);

      // ensure the message was for this chat box
      // if (payload.data.participant.commandChannel !== localInfo.commandChannel) {
      //   LogInfo(`'${localInfo.connectionId}' onParticipantUnassigned message not for '${localInfo.commandChannel}'`);
      //   return;
      // }

      localInfo.assigned = false;

      this.setState({ localInfo: localInfo });

      this.onSystemMessage({
        commandChannel: localInfo?.commandChannel,
        data: `'${payload.data.participant.nickName}' was disconnected`
      });

    } catch (error) {      
      LogException(`onLearnerUnassigned[${this.props.index}]`, error);
    }
  }

  // system message method listener
  onSystemMessage(payload) {

    try {

      let { localInfo } = this.state;

      LogInfo(`'onSystemMessage[${this.props.index}] (${JSON.stringify(payload, null, 1)})`);

      payload.isSystemMessage = true;
      this.onMessage(payload);

    } catch (error) {
      LogException(`onSystemMessage[${this.props.index}]`, error);
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

      LogInfo(`'onMessage[${this.props.index}] (${JSON.stringify(payload, null, 1)})`);

      // ensure the message was for this chat box
      if (payload.commandChannel !== localInfo.commandChannel) {
        LogInfo(`'${localInfo.connectionId}' onMessage message not for '${localInfo.commandChannel}'`);
        return;
      }

      LogInfo(`'${localInfo.connectionId}' onMessage message for '${localInfo.commandChannel}'`);

      // tri-ary flag: 
      //  true = locally initiated message (echo), 
      //  false = remotely initiated message
      //  null - system message
      let isLocal = null;

      // if not system message, determine locality
      // of message
      if (!payload.isSystemMessage) {
        LogInfo(`'${localInfo.connectionId}' system message.  testing message direction: ('${senderInfo.userId}' == '${payload.from}'?)`);
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
      LogException(`onMessage[${this.props.index}]`, error);
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

      LogInfo(`'onClickJumpNode[${this.props.index}] (${JSON.stringify(payload, null, 1)})`);

      this.connection.send(constants.SIGNALCMD_JUMP_NODE, payload);

      this.setState({ inJumpNodeMode: false });

    } catch (error) {
      LogException(`onClickJumpNode[${this.props.index}]`, error);
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

        LogInfo(`'onSelectNode[${this.props.index}] (${event.target.value})`);

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
      LogException(`onSelectNode[${this.props.index}]`, error);
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

        LogInfo(`'onSendClicked[${this.props.index}] (${JSON.stringify(messagePayload, null, 1)})`);

        this.connection.send(constants.SIGNALMETHOD_MESSAGE, messagePayload);
      }

      // clear out sent messages
      this.setState({ message: '' });

    } catch (error) {
      LogException(`onSendClicked[${this.props.index}]`, error);
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
      LogException(`evaluateMacro[${this.props.index}]`, error);
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
      LogInfo(`'onMessageKeyDown[${this.props.index}] entering macro mode`);
    }

    else if ((event.key === " ") && inMacroMode) {
      LogInfo(`'onMessageKeyDown[${this.props.index}] evaluating macro ${message}`);

      this.setState({ inMacroMode: false });
      this.evaluateMacro();
    }

  }

  onMessageTextChanged = (event) => {
    let message = this.state.message;

    // test for smiley emoji
    event.target.value = checkText(event.target.value);    

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
      inJumpNodeMode,
      isModerator,
      localInfo,
      mapNodes,
      maxHeight,
      message,
      selectedNodeId,
      senderInfo,
      show,
      width,
    } = this.state;

    if (!show) {
      return null;
    }

    const divLayout = { width: '100%', border: '2px solid black', backgroundColor: '#3333' };
    const systemMessageStyle = {
      border: 'none',
      backgroundColor: 'grey',
      color: 'white',
      borderRadius: '25px',
      fontSize: '14px',
      padding: '10px'
    };
    const localMessageStyle = {
      border: 'none',
      color: 'white',
      fontSize: '16px',
      padding: '10px',
      lineHeight: '1.8'
    };
    const remoteMessageStyle = {
      border: 'none',
      backgroundColor: 'grey',
      color: 'white',
      fontSize: '16px',
      padding: '10px',
      lineHeight: '1.8'
    };

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

                  <TableRow name="convrow" key={conversationItem.key}>
                    
                    {(conversationItem.isLocalMessage == null) && (
                      <TableCell style={{ borderBottom: "none" }} align="center">
                        <span style={systemMessageStyle}>
                          {conversationItem.message}
                        </span>
                      </TableCell>
                    )}

                    {(conversationItem.isLocalMessage === true) && (
                      <TableCell style={{ borderBottom: "none" }} align="right">
                        <Table stickyHeader size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell style={{ width: '10%' }}/>
                              <TableCell align="left" style={{ borderRadius: '25px', backgroundColor: 'blue' }}>
                                <span style={localMessageStyle}>
                                  {conversationItem.message}
                                </span>
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
                              <TableCell align="left" style={{ borderRadius: '25px', backgroundColor: 'gray' }}>
                                <span style={remoteMessageStyle}>
                                  {conversationItem.message}
                                </span>
                              </TableCell>
                              <TableCell style={{ width: '10%' }}/>
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

      LogException(`render[${this.props.index}]`, error);
      return (
        <>
          <b>"{error.message}"</b>
        </>
      );
    }
  }

}

export default withStyles(styles)(Chat);
