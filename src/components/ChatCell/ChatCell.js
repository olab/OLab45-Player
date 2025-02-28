// @flow
import * as React from "react";
import { Grid, TableCell } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { Log, LogInfo, LogError } from "../../utils/Logger";
import log from "loglevel";
import styles from "../WikiTags/styles.module.css";

import Chat from "./Chat";
import ChatStatusBar from "./ChatStatusBar";
// var constants = require("../../services/constants");
import constants from "../../services/constants";

class ChatCell extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...this.props,
      lastMessageTime: null,
    };

    this.connectionId = this.state.connection.connectionId?.slice(-3);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.localInfo !== this.props.localInfo) {
      this.setState({ localInfo: this.props.localInfo });
    }
  }

  render() {
    try {
      const {
        connection,
        senderInfo,
        localInfo,
        playerProps,
        lastMessageTime,
        session,
      } = this.state;

      // log.debug(
      //   `ChatCell[${this.props.index}] render. localInfo: ${JSON.stringify(
      //     localInfo
      //   )}`
      // );

      let cellStyling = Object.assign({ padding: 7 }, this.props.style);
      if (!localInfo.show) {
        cellStyling = { display: "none", padding: 7 };
      }

      return (
        <TableCell style={cellStyling}>
          <Chat
            index={this.props.index}
            mapNodes={this.props.mapNodes}
            session={session}
            show={localInfo.show}
            isModerator={this.props.isModerator}
            onPopupMessage={this.props.onPopupMessage}
            localInfo={localInfo}
            senderInfo={senderInfo}
            playerProps={playerProps}
            connection={connection}
            signalr={this.props.signalr}
          />
          <ChatStatusBar
            index={this.props.index}
            show={localInfo.show}
            isModerator={this.props.isModerator}
            localInfo={localInfo}
            lastMessageTime={lastMessageTime}
            senderInfo={senderInfo}
            connection={connection}
            signalr={this.props.signalr}
          />
        </TableCell>
      );
    } catch (error) {
      return <b>TurkerStatusBar: {error.message}</b>;
    }
  }
}

export default withStyles(styles)(ChatCell);
