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
  Tooltip,
} from "@material-ui/core";
import log from "loglevel";
import localCss from "./RememberedLearners.module.css";

// var constants = require("../../../../../../services/constants");
import constants from "../../../../../../services/constants";

class RememberedLearners extends React.Component {
  constructor(props) {
    super(props);

    this.watchedLearnerHelper = this.props.watchedLearnerHelper;

    this.state = {
      selectedLearnerUserId: "0",
      watchProfile: this.watchedLearnerHelper.watchProfile,
    };

    this.onClickAutoAssign = this.onClickAutoAssign.bind(this);
    this.onLearnerSelected = this.onLearnerSelected.bind(this);
    this.onForgetClicked = this.onForgetClicked.bind(this);
  }

  onLearnerSelected(event) {
    let { selectedLearnerUserId, watchedLearners, localInfo } = this.state;

    // test for valid turkee selected from available list
    if (event.target.value !== "0") {
      log.debug(`onLearnerSelected: ${event.target.value}`);

      // find learner in atrium list
      const watchedLearner = this.watchedLearnerHelper.FindWatchedLearner(
        event.target.value
      );

      if (watchedLearner) {
        selectedLearnerUserId = watchedLearner.userId;
      }

      this.setState({ selectedLearnerUserId: selectedLearnerUserId });
    }
  }

  onForgetClicked(event) {
    try {
      const { selectedLearnerUserId } = this.state;

      // don't do anything if nothing selected
      if (selectedLearnerUserId == undefined || selectedLearnerUserId == "0") {
        return;
      }

      this.watchedLearnerHelper.RemoveWatchedLearner(selectedLearnerUserId);

      // signal watched learners change to parent
      if (this.props.onUpdateWatchedLearners) {
        this.props.onUpdateWatchedLearners(
          this.watchedLearnerHelper.watchProfile.watchedLearners
        );
      } else {
        throw new Error("onForgetClicked callback not set");
      }

      this.setState({ selectedLearnerUserId: "0" });
    } catch (error) {
      log.error(`'onForgetClicked exception: ${error.message}`);
    }
  }

  onClickAutoAssign(event) {
    // signal watched learners change to parent
    if (this.props.onClickAutoAssign) {
      this.props.onClickAutoAssign(event.target.checked);
    } else {
      throw new Error("onClickAutoAssign callback not set");
    }
  }

  render() {
    const { watchProfile, selectedLearnerUserId } = this.state;

    return (
      <Grid container direction="row" justifyContent="flex-end">
        <Grid item xs={7}>
          <FormLabel>
            {watchProfile.watchedLearners.length} remembered learners
          </FormLabel>
          <Select
            value={selectedLearnerUserId}
            onChange={this.onLearnerSelected}
            style={{ width: "100%" }}
          >
            <MenuItem key="0" value="0">
              <em>--Select--</em>
            </MenuItem>
            {watchProfile.watchedLearners.map((item) => (
              <MenuItem key={item.userId} value={item.userId}>
                {item.nickName}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        <Grid container item xs={2}>
          <Tooltip
            title="Remove learner from watch list"
            aria-label="add"
            placement="top"
          >
            <Button
              variant="contained"
              color="primary"
              size="small"
              className={localCss.assignButton}
              onClick={this.onForgetClicked}
            >
              &nbsp;Forget&nbsp;
            </Button>
          </Tooltip>
        </Grid>

        <Grid item xs={3}>
          <FormControlLabel
            control={
              <Tooltip title="Auto assign when learner arrives" placement="top">
                <Checkbox
                  checked={watchProfile.autoAssign}
                  onChange={this.onClickAutoAssign}
                  name="checkedF"
                  color="primary"
                />
              </Tooltip>
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
