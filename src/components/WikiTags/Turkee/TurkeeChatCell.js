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

class TurkeeChatCell extends React.Component {

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
          connection={connection}
          moderatorInfo={moderatorInfo}
          chatInfo={chatInfo}
          playerProps={playerProps} />
        <TurkeeChatStatusBar
          connection={connection}
          learnerInfo={learnerInfo} />
      </TableCell>
    );
  } catch(error) {
    return (
      <b>TurkerStatusBar: {error.message}</b>
    );
  }
}

export default withStyles(styles)(TurkeeChatCell);
