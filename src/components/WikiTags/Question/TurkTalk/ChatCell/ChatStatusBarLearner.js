// @flow
import * as React from "react";
import { Grid } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { Log, LogInfo, LogError } from "../../../../../utils/Logger";
import log from "loglevel";
import styles from "../../../styles.module.css";
import { connect } from "formik";
import { LastPageOutlined } from "@material-ui/icons";
var constants = require("../../../../../services/constants");

class ChatStatusBarLearner extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      lastUpdate: null,
      localInfo: this.props.localInfo,
      connection: this.props.connection,
      centerStatusString: null,
    };

    this.connectionId = this.props.connection.connectionId?.slice(-3);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.show !== this.props.show) {
      this.setState({ show: this.props.show });
    }
    if (prevProps.localInfo !== this.props.localInfo) {
      this.setState({ localInfo: this.props.localInfo });
    }
  }

  generateLeftStatusString() {
    let { connection } = this.state;
    if (connection.connectionId && connection.connectionId.length > 0) {
      return `${
        connection._connectionState
      } (Id: ${connection.connectionId.slice(-3)})`;
    } else {
      return connection._connectionState;
    }
  }

  generateCenterStatusString() {
    return "-";
  }

  generateRightStatusString() {
    return null;
  }

  render() {
    try {
      let { show } = this.state;

      if (!show) {
        return null;
      }

      const statusLeftString = this.generateLeftStatusString();
      const statusCenterString = this.generateCenterStatusString();
      const statusRightString = this.generateRightStatusString();

      const divLayout = {
        width: "100%",
        border: "2px solid black",
        backgroundColor: "#3333",
        borderTop: "0px solid black",
      };
      const gridLayout = { fontWeight: "bold", backgroundColor: "#grey" };

      return (
        <div name="chatStatusBar" style={divLayout}>
          <Grid container style={gridLayout}>
            <Grid container justifyContent="flex-start" item xs={4}>
              &nbsp;{statusLeftString}
            </Grid>
            <Grid container justifyContent="center" item xs={4}>
              {statusCenterString}
            </Grid>
            <Grid container justifyContent="flex-end" item xs={4}>
              {statusRightString}&nbsp;
            </Grid>
          </Grid>
        </div>
      );
    } catch (error) {
      return <b>ChatStatusBarLearner: {error.message}</b>;
    }
  }
}

export default withStyles(styles)(ChatStatusBarLearner);
