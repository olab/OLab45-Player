// @flow
import * as React from "react";
import {
  Button,
  Grid,
  FormLabel,
  Table,
  TableBody,
  MenuItem,
  Select,
  TableRow,
  Snackbar,
} from "@material-ui/core";
import { Log, LogInfo, LogError } from "../../../../../utils/Logger";
import log from "loglevel";
import { withStyles } from "@material-ui/core/styles";
import styles from "../../../styles.module.css";
import localCss from "./RememberedLearners.module.css";
const playerState = require("../../../../../utils/PlayerState").PlayerState;
var constants = require("../../../../../services/constants");

class RememberedLearners extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      learners: [],
      selectedLearnerUserId: "0",
    };
  }

  onUnrememberClicked(event) {
    let { localInfo } = this.state;

    try {
      const { selectedLearnerUserId } = this.state;
      let selectedLearner = null;

      if (selectedLearnerUserId == undefined || selectedLearnerUserId == "0") {
        return;
      }

      // get unassigned atrium learner from list
      for (let item of this.state.learners) {
        if (item.userId === selectedLearnerUserId) {
          selectedLearner = item;
        }
      }

      if (!selectedLearner) {
        throw new Error(
          `Unable to find selected learner ${selectedLearnerUserId}`
        );
      }

      // save remembered state to local storage
      this.updateRememberedLearnerState();
    } catch (error) {
      LogError(
        `'${this.connectionId}' onUnrememberClicked exception: ${error.message}`
      );
    }
  }

  render() {
    const { learners, selectedLearnerUserId } = this.state;

    return (
      <Grid container direction="row">
        <Grid item xs={4}>
          <FormLabel>{learners.length} remembered learners</FormLabel>
          <Select
            value={selectedLearnerUserId}
            onChange={this.onLearnerSelected}
            style={{ width: "100%" }}
          >
            <MenuItem key="0" value="0">
              <em>--Select--</em>
            </MenuItem>
            {learners.map((item) => (
              <MenuItem key={item.userId} value={item.userId}>
                {item.nickName}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid container item xs={1}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            className={localCss.assignButton}
            onClick={this.onUnrememberClicked}
          >
            &nbsp;Assign&nbsp;
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default RememberedLearners;
