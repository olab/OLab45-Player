// @flow
import * as React from "react";
import { LogError } from "../../../../../utils/Logger";
import log from "loglevel";
import SlotInfo from "../../../../../helpers/SlotInfo";
import AssigneeSearchableList from "./AssigneeSearchableList/AssigneeSearchableList";
const playerState = require("../../../../../utils/PlayerState").PlayerState;
var constants = require("../../../../../services/constants");

class Atrium extends React.Component {
  constructor(props) {
    super(props);

    let atrium = playerState.GetAtrium();
    this.connection = this.props.connection;
    this.connectionId = this.props.connection.connectionId?.slice(-3);

    this.state = {
      atriumLearners: [],
      selectedLearnerUserId: "0",
      userName: this.props.userName,
      localInfo: new SlotInfo(),
    };

    this.onAtriumUpdate = this.onAtriumUpdate.bind(this);

    var atriumSelf = this;
    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => {
      atriumSelf.onCommand(payload);
    });
  }

  onCommand(payload) {
    try {
      if (payload.command === constants.SIGNALCMD_ATRIUMUPDATE) {
        log.debug(`'${this.connectionId}' onCommand: ${payload.command}`);
        this.onAtriumUpdate(payload.data);
      }
    } catch (error) {
      LogError(
        `'${this.connectionId}' onAtriumCommandCallback exception: ${error.message}`
      );
    }
  }

  // handle atrium contents updated
  onAtriumUpdate(payloadArray) {
    let { atriumLearners, selectedLearnerUserId } = this.state;

    try {
      atriumLearners = [];

      // save atrium contents if array passed in
      if (Array.isArray(payloadArray) && payloadArray.length >= 0) {
        let key = 1;
        for (const payloadItem of payloadArray) {
          // make a copy of the object so it can be modified
          var learner = Object.assign({}, payloadItem);

          // add a 'key/value' properties so atriumContents plays nicely with
          // javascript .map()
          learner.key = `${key++}`;

          atriumLearners.push(learner);
        }

        log.debug(
          `'${this.connectionId}' onAtriumUpdate: refreshing: '${JSON.stringify(
            atriumLearners
          )}'`
        );

        if (this.props.onAtriumUpdate) {
          this.props.onAtriumUpdate(atriumLearners);
        }

        let selectedLearner = null;
        // get unassigned atrium learner from list
        for (let item of atriumLearners) {
          if (item.userId === selectedLearnerUserId) {
            selectedLearner = item;
          }
        }

        // try and do some smart prevention of
        // losing a currently selected learner
        // based on if one was previously selected.
        if (selectedLearner == null) {
          this.setState({
            atriumLearners: atriumLearners,
            selectedLearnerUserId: "0",
          });
        } else {
          this.setState({
            atriumLearners: atriumLearners,
          });
        }

        this.updateAtriumState();
      }
    } catch (error) {
      LogError(
        `'${this.connectionId}' onAtriumUpdate exception: ${error.message}`
      );
    }
  }

  assignAtriumLearner({ id: userId }) {
    log.debug(
      `assignAtriumLearner '${this.connectionId}': ${userId}`
    );

    const { atriumLearners } = this.state;
    const selectedLearner = atriumLearners.find(learner => learner.userId == userId);

    if ( ! selectedLearner ) {
      LogError('Could not find learner to assign', userId);
      return;
    }

    // signal the parent component of a learner assignment
    if (this.props.onAtriumAssignClicked) {
      this.props.onAtriumAssignClicked(selectedLearner);
    }

    // reset the selected learner to empty
    this.setState({
      selectedLearnerUserId: "0",
    });

    // save atrium state to local storage
    this.updateAtriumState();
  }

  updateAtriumState() {
    let { selectedLearnerUserId, atriumLearners, localInfo } = this.state;

    try {
      const state = {
        roomName: localInfo.roomName,
        selectedLearnerUserId,
        atriumLearners,
      };

      playerState.SetAtrium(state);
    } catch (error) {
      LogError(
        `'${this.connectionId}' updateAtriumState exception: ${error.message}`
      );
    }
  }

  render() {
    const { atriumLearners } = this.state;
    const learnersList = atriumLearners.map(learner => ({
      id: learner.userId,
      text: learner.nickName
    }))

    return (
      <div>
        <small>Atrium ({atriumLearners.length} waiting)</small>
        <AssigneeSearchableList
          list={learnersList}
          selectItem={this.assignAtriumLearner.bind(this)} />
      </div>
    );
  }
}

export default Atrium;
