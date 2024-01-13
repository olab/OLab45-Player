// @flow
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  Paper,
  TableContainer,
  TableRow,
} from "@material-ui/core";
import { Log, LogInfo, LogError, LogException } from "../../utils/Logger";
import log from "loglevel";
import { withStyles } from "@material-ui/core/styles";
import styles from "../WikiTags/styles.module.css";

var constants = require("../../../../../services/constants");

class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      conversation: [],
      ...this.props,
    };

    var chatSelf = this;

    this.props.connection.on(constants.SIGNALMETHOD_MESSAGE, (payload) => {
      chatSelf.onMessage(payload);
    });

    this.messageRef = React.createRef();
  }

  createData(key, message, isLocalMessage) {
    return { key, message, isLocalMessage };
  }

  scrollToBottom = () => {
    try {
      this.messageRef.current.scrollTop = this.messageRef.current?.scrollHeight;
    } catch (error) {}
  };

  // chat message method listener
  onMessage(payload) {
    try {
      const { conversation, localInfo } = this.state;

      // ensure the message was for this chat box
      if (payload.SessionId !== localInfo.sessionId) {
        return;
      }

      // signal parent listener that a message has come in
      if (this.props.onMessage) {
        this.props.onMessage(payload);
      }

      LogInfo(
        `'${localInfo.sessionId}' onMessage '${JSON.stringify(payload)}'`
      );

      // tri-ary flag:
      //  true = locally initiated message (echo),
      //  false = remotely initiated message
      //  null - system message
      let isLocalMessage = null;

      // if not system message, determine locality
      // of message
      if (!payload.IsSystemMessage) {
        isLocalMessage = localInfo.ToSessionId == payload.FromSessionId;
      }

      conversation.push(
        this.createData(conversation.length, payload, isLocalMessage)
      );

      this.setState({ conversation: conversation });
      this.scrollToBottom();
    } catch (error) {
      LogException(`onMessage[${this.props.seatNumber}]`, error);
    }
  }

  render() {
    let { conversation } = this.state;

    const divLayout = {
      width: "100%",
      border: "2px solid black",
      backgroundColor: "#3333",
    };

    const systemMessageStyle = {
      border: "none",
      backgroundColor: "green",
      color: "white",
      borderRadius: "16px",
      fontSize: "16px",
      padding: "10px",
      lineHeight: "1.8",
    };

    const localMessageStyle = {
      border: "none",
      color: "white",
      fontSize: "16px",
      padding: "10px",
      lineHeight: "1.8",
    };

    const remoteMessageStyle = {
      border: "none",
      backgroundColor: "grey",
      color: "white",
      fontSize: "16px",
      padding: "10px",
      lineHeight: "1.8",
    };

    const tableContainerStyle = { maxHeight: 300 };
    let disabled = true;

    // disable entry if:
    //  1) not assigned in room
    //  2) not connected to hub
    disabled = !localInfo.assigned || !this.props.connection.connectionId;

    try {
      return (
        <div name="chat" style={divLayout}>
          <TableContainer
            ref={this.messageRef}
            name="conversation"
            component={Paper}
            style={tableContainerStyle}
          >
            <Table stickyHeader size="small">
              <TableBody>
                {conversation.map((conversationItem) => (
                  <TableRow name="convrow" key={conversationItem.key}>
                    {conversationItem.isLocalMessage == null && (
                      <TableCell
                        style={{ borderBottom: "none" }}
                        align="center"
                      >
                        <span style={systemMessageStyle}>
                          {conversationItem.message}
                        </span>
                      </TableCell>
                    )}

                    {conversationItem.isLocalMessage === true && (
                      <TableCell style={{ borderBottom: "none" }} align="right">
                        <Table stickyHeader size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell style={{ width: "10%" }} />
                              <TableCell
                                align="left"
                                style={{
                                  borderRadius: "25px",
                                  backgroundColor: "blue",
                                }}
                              >
                                <span style={localMessageStyle}>
                                  {conversationItem.message}
                                </span>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableCell>
                    )}

                    {conversationItem.isLocalMessage === false && (
                      <TableCell style={{ borderBottom: "none" }}>
                        <Table stickyHeader size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell
                                align="left"
                                style={{
                                  borderRadius: "25px",
                                  backgroundColor: "gray",
                                }}
                              >
                                <span style={remoteMessageStyle}>
                                  {conversationItem.message}
                                </span>
                              </TableCell>
                              <TableCell style={{ width: "10%" }} />
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
        </div>
      );
    } catch (error) {
      LogException(`render[${this.props.seatNumber}]`, error);
      return (
        <>
          <b>"{error.message}"</b>
        </>
      );
    }
  }
}

export default withStyles(styles)(Chat);
