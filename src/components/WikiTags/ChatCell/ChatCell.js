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
      senderInfo: this.props.senderInfo,
      playerProps: this.props.playerProps,
      lastMessageTime: null
    };

    this.onCommandCallback = this.onCommandCallback.bind(this);
    this.connectionId = this.state.connection.connectionId?.slice(-3);

    var self = this;
    this.state.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { self.onCommandCallback(payload) });

  }

  // command method listener
  onCommandCallback(payload) {
    // log.debug(`'${this.state.connection.connectionId?.slice(-3)}' onChatCellCommandCallback: ${payload.command}`);
  }

  render() {

    const cellStyling = { padding: 7 }
    const {
      connection,
      senderInfo,
      localInfo,
      playerProps,
      lastMessageTime
    } = this.state;

    return (
      <TableCell style={cellStyling}>
        <Chat
          show={localInfo.show}
          isModerator={this.props.isModerator}
          connection={connection}
          localInfo={localInfo}
          senderInfo={senderInfo}
          playerProps={playerProps} />
        <ChatStatusBar
          show={localInfo.show}
          isModerator={this.props.isModerator}
          connection={connection}
          localInfo={localInfo}
          lastMessageTime={lastMessageTime}
          senderInfo={senderInfo} />
      </TableCell>
    );


  } catch(error) {
    return (
      <b>TurkerStatusBar: {error.message}</b>
    );
  }
}

export default withStyles(styles)(ChatCell);
