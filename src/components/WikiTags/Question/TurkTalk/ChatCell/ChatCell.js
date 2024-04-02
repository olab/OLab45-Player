// @flow
import * as React from "react";
import { Table, TableBody, TableCell, TableRow } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import styles from "../../../styles.module.css";

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
      const { connection, localInfo, lastMessageTime, progressMessage } =
        this.state;

      const tableStyle = {
        border: "2px solid black",
        backgroundColor: "#3333",
        width: "100%",
      };

      let cellStyling = Object.assign(
        { padding: 0, width: "100%" },
        this.props.style
      );

      return (
        <Table style={tableStyle}>
          <TableBody>
            <TableRow>
              <TableCell style={cellStyling}>
                <Chat
                  localInfo={localInfo}
                  connection={connection}
                  progressMessage={progressMessage}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell style={cellStyling}>
                {localInfo.isModerator && (
                  <ChatStatusBarModerator
                    localInfo={localInfo}
                    lastMessageTime={lastMessageTime}
                    connection={connection}
                  />
                )}
                {!localInfo.isModerator && (
                  <ChatStatusBarLearner
                    seatNumber={this.props.seatNumber}
                    localInfo={localInfo}
                    connection={connection}
                  />
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    } catch (error) {
      return <b>TurkerStatusBar: {error.message}</b>;
    }
  }
}

export default withStyles(styles)(ChatCell);
