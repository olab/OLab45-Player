// @flow
import * as React from "react";
import {
  Button,
  Grid,
  FormLabel,
  MenuItem,
  Select,
  Checkbox,
  FormControlLabel,
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
      watchedLearners: this.props.watchedLearners,
      selectedLearnerUserId: "0",
      autoAssign: false,
    };

    this.onUnrememberClicked = this.onUnrememberClicked.bind(this);
    this.onAutoRememberClicked = this.onAutoRememberClicked.bind(this);
    this.onLearnerSelected = this.onLearnerSelected.bind(this);
  }

  onLearnerSelected(event) {
    let { selectedLearnerUserId, watchedLearners, localInfo } = this.state;

    // test for valid turkee selected from available list
    if (event.target.value !== "0") {
      log.debug(`onLearnerSelected: ${event.target.value}`);

      // find learner in atrium list
      for (let item of watchedLearners) {
        if (item.userId === event.target.value) {
          selectedLearnerUserId = item.userId;
        }
      }

      this.setState({ selectedLearnerUserId: selectedLearnerUserId });
    }
  }

  onUnrememberClicked(event) {
    try {
      const { watchedLearners, selectedLearnerUserId } = this.state;

      // don't do anything if nothing selected
      if (selectedLearnerUserId == undefined || selectedLearnerUserId == "0") {
        return;
      }

      // get unassigned atrium learner from list
      let selectedLearner = null;
      for (let item of watchedLearners) {
        if (item.userId === selectedLearnerUserId) {
          selectedLearner = item;
        }
      }

      if (!selectedLearner) {
        throw new Error(
          `Unable to find selected learner ${selectedLearnerUserId}`
        );
      }

      // signal watched learners change to parent
      if (this.props.onUpdateWatchedLearners) {
        log.debug(
          `new watched learners ${JSON.stringify(watchedLearners, null, 2)}`
        );
        this.props.onUpdateWatchedLearners(watchedLearners);
      } else {
        throw new Error("onUpdateWatchedLearners callback not set");
      }
    } catch (error) {
      log.error(`'onUnrememberClicked exception: ${error.message}`);
    }
  }

  onAutoRememberClicked(event) {
    log.debug(`'onAutoRememberClicked clicked`);
    const { autoAssign } = this.state;
    this.setState({
      autoAssign: !autoAssign,
    });
  }

  render() {
    const { watchedLearners, selectedLearnerUserId, autoAssign } = this.state;

    return (
      <Grid container direction="row" justifyContent="flex-end">
        <Grid item xs={7}>
          <FormLabel>{watchedLearners.length} remembered learners</FormLabel>
          <Select
            value={selectedLearnerUserId}
            onChange={this.onLearnerSelected}
            style={{ width: "100%" }}
          >
            <MenuItem key="0" value="0">
              <em>--Select--</em>
            </MenuItem>
            {watchedLearners.map((item) => (
              <MenuItem key={item.userId} value={item.userId}>
                {item.nickName}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        <Grid container item xs={2}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            className={localCss.assignButton}
            onClick={this.onUnrememberClicked}
          >
            &nbsp;Forget&nbsp;
          </Button>
        </Grid>

        <Grid item xs={3}>
          <FormControlLabel
            control={
              <Checkbox
                checked={autoAssign}
                onChange={this.onAutoRememberClicked}
                name="checkedF"
                color="primary"
              />
            }
            labelPlacement="top"
            label="Auto-assign"
          />
        </Grid>
      </Grid>
    );
  }
}

export default RememberedLearners;
