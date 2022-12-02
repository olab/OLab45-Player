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
import { PlaylistPlayOutlined } from '@material-ui/icons';

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
    this.scrollToBottom = this.scrollToBottom.bind(this);

    var self = this;
    this.connection.on(constants.SIGNALCMD_MESSAGE, (payload) => { self.onMessageCallback(payload) });
    this.messageRef = React.createRef();

    log.debug(`Chat component initialized.  group = '${this.props.learnerInfo.GroupName}'`);
  }

  onMessageCallback(payload) {

    try {

      log.info(`onMessageCallback (${JSON.stringify(payload, null, 1)})`);

      // test if the message was for this learner
      if (payload.recipientGroupName !== this.props.learnerInfo.commandChannel) {
        return;
      }

      let { conversation } = this.state;

      let isLocal = true;

      // test if this is a moderator-hosted component
      if ( this.props.moderatorInfo ) {
        log.info(`moderator msg locality: ('${this.props.moderatorInfo.userId}' == '${payload.from}'?)`);        
        isLocal = this.props.moderatorInfo.userId == payload.from;
      } 
      else {
        log.info(`learner msg locality: ('${this.props.learnerInfo.userId}' == '${payload.from}'?)`);        
        isLocal = this.props.learnerInfo.userId == payload.from;
      }

      conversation.push(this.createData(conversation.length, payload.data, isLocal));

      this.setState({
        conversation: conversation
      });

      this.scrollToBottom();

    } catch (error) {
      log.error(`onMessageCallback exception: ${error.message}`);
    }

  }

  onSendClicked = (event) => {

    try {

      const { message } = this.state;
      const { connectionId } = this.props.learnerInfo;

      if (message.length > 0) {

        let from = {};

        // if component has moderator, then reflect
        // that in the message sender        
        if (this.props.moderatorInfo) {
          from = Object.assign({}, this.props.moderatorInfo);
        }
        else {
          from = this.props.learnerInfo;
        }

        const messagePayload = {
          envelope: {
            to: this.props.learnerInfo.commandChannel,
            from: from
          },
          Data: message
        };

        log.debug(`onSendClicked: ${JSON.stringify(messagePayload, null, 2)}]`);

        this.connection.send(constants.SIGNALCMD_MESSAGE, messagePayload);
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
    } = this.state;

    const divLayout = { width: width, border: '2px solid black', backgroundColor: '#3333' };
    const tableContainerStyle = { height: '100%', maxHeight: maxHeight };

    // disable entry if do not have a group name assigned or not connected to hub
    const disabled = (
      (this.props.learnerInfo.commandChannel === '') ||
      !this.props.learnerInfo.connected
    );

    try {

      return (
        <div name="chat" style={divLayout}>
          <TableContainer ref={this.messageRef} name="conversation" component={Paper} style={tableContainerStyle}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell><center><b></b></center></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {conversation.map((conversationItem) => (
                  <TableRow style={{ bottomBorder: '0px' }} key={conversationItem.key}>
                    {conversationItem.isLocalMessage && (
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
                    {!conversationItem.isLocalMessage && (
                      <TableCell style={{ borderBottom: "none" }} align="right">
                        <b>Them:&nbsp;</b>
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
