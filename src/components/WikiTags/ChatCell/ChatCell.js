// @flow
import * as React from 'react';
import {
  Grid,
  TableCell
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import log from 'loglevel';
import styles from '../styles.module.css';

import Chat from './Chat'
import ChatStatusBar from './ChatStatusBar';
var constants = require('../../../services/constants');

class ChatCell extends React.Component {

  constructor(props) {
    
    super(props);

    this.state = {
      connection: this.props.connection,
      localInfo: this.props.localInfo,
      remoteInfo: this.props.remoteInfo,
      playerProps: this.props.playerProps,
      lastMessageTime: null
    };

    this.onCommandCallback = this.onCommandCallback.bind(this);
    this.onMessageReceived = this.onMessageReceived.bind(this);
    this.connection = this.props.connection;

    var self = this;
    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { self.onCommandCallback(payload) });    

  }

  // command method listener
  onCommandCallback(payload) {
    log.debug(`onChatCellCommandCallback: ${payload.command}`);
  }

  // a message was received in a child component
  onMessageReceived(message) {    
    let { lastMessageTime } = this.state;
    lastMessageTime = new Date();
    this.setState( { lastMessageTime: lastMessageTime });
  }

  render() {

    const cellStyling = { padding: 7 }
    const {
      connection,
      remoteInfo,
      localInfo,
      playerProps,
    } = this.state;

    return (
      <TableCell style={cellStyling}>
        <Chat
          isModerator={this.props.isModerator}
          onMessageReceived={this.onMessageReceived}
          connection={connection}
          localInfo={localInfo}
          remoteInfo={remoteInfo}
          playerProps={playerProps} />
        <ChatStatusBar
          isModerator={this.props.isModerator}
          onMessageReceived={this.onMessageReceived}
          connection={connection}
          remoteInfo={remoteInfo} />
      </TableCell>
    );
  } catch(error) {
    return (
      <b>TurkerStatusBar: {error.message}</b>
    );
  }
}

export default withStyles(styles)(ChatCell);
