// @flow
import * as React from 'react';
import {
  Grid,
  TableCell
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import log from 'loglevel';
import styles from '../styles.module.css';

import Chat from '../../Chat/Chat'
import TurkeeChatStatusBar from './TurkeeChatStatusBar';

class TurkerChatCell extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      connection: this.props.connection,
      chatInfo: this.props.chatInfo,
      moderatorInfo: this.props.moderatorInfo,
      playerProps: this.props.playerProps,
      learnerInfo: this.props.learnerInfo,
      lastMessageTime: '-'
    };

    this.onMessageReceived = this.onMessageReceived.bind(this);


  }

  onMessageReceived(payload) {

    let { learnerInfo } = this.state;

    // update last rec'd only if from 'someone else'
    if (payload.from == learnerInfo.userId) {

      let now = new Date();
      const hours = `0${now.getHours()}`;
      const minutes = `0${now.getMinutes()}`;
      learnerInfo.lastMessageTime = `Last rec'd: ${hours.slice(hours.length-2)}:${minutes.slice(minutes.length-2, minutes.length)}`;
      this.setState({ learnerInfo: learnerInfo });
    }

  }

  render() {

    const cellStyling = { padding: 7 }
    const {
      connection,
      chatInfo,
      moderatorInfo,
      playerProps,
      learnerInfo,
    } = this.state;

    return (
      <TableCell style={cellStyling}>
        <Chat
          onMessageReceived={this.onMessageReceived}
          connection={connection}
          moderatorInfo={moderatorInfo}
          chatInfo={chatInfo}
          playerProps={playerProps} />
        <TurkeeChatStatusBar
          onMessageReceived={this.onMessageReceived}
          connection={connection}
          chatInfo={chatInfo} />
      </TableCell>
    );
  } catch(error) {
    return (
      <b>TurkerStatusBar: {error.message}</b>
    );
  }
}

export default withStyles(styles)(TurkerChatCell);
