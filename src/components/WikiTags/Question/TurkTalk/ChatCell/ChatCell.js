// @flow
import * as React from "react";
import { TableCell } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import styles from "../WikiTags/styles.module.css";

import Chat from "./Chat";
import ChatStatusBarLearner from "./ChatStatusBarLearner";
import ChatStatusBarModerator from "./ChatStatusBarModerator";

class ChatCell extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...this.props,
      lastMessageTime: null,
      isModerator: this.props.hasOwnProperty("isModerator")
        ? this.props.isModerator
        : false,
    };

    this.connectionId = this.state.connection.connectionId?.slice(-3);
  }

  render() {
    try {
      const { connection, localInfo, isModerator, lastMessageTime } =
        this.state;

      let cellStyling = Object.assign({ padding: 7 }, this.props.style);
      if (!localInfo.show) {
        cellStyling = { display: "none", padding: 7 };
      }

      return (
        <TableCell style={cellStyling}>
          <Chat
            seatNumber={this.props.seatNumber}
            localInfo={localInfo}
            connection={connection}
          />
          {isModerator && (
            <ChatStatusBarModerator
              seatNumber={this.props.seatNumber}
              localInfo={localInfo}
              lastMessageTime={lastMessageTime}
              connection={connection}
            />
          )}
          {!isModerator && (
            <ChatStatusBarLearner
              seatNumber={this.props.seatNumber}
              localInfo={localInfo}
              lastMessageTime={lastMessageTime}
              connection={connection}
            />
          )}
        </TableCell>
      );
    } catch (error) {
      return <b>TurkerStatusBar: {error.message}</b>;
    }
  }
}

export default withStyles(styles)(ChatCell);
