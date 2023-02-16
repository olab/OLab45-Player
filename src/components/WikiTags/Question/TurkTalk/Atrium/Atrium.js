// @flow
import * as React from 'react';
import {
  Button, Grid, FormLabel, Table,
  TableBody, MenuItem, Select, TableRow, Snackbar
} from '@material-ui/core';
import { Log, LogInfo, LogError } from '../../../../../utils/Logger';
import log from 'loglevel';
import { withStyles } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';

import styles from '../../../styles.module.css';
import Participant from '../../../../../helpers/participant';
import SlotInfo from '../../../../../helpers/SlotInfo';
const playerState = require('../../../../../utils/PlayerState').PlayerState;
var constants = require('../../../../../services/constants');

class Atrium extends React.Component {

  constructor(props) {

    super(props);

    let atrium = playerState.GetAtrium();
    this.connection = this.props.connection;

    this.state = {
      atriumLearners: [],
      selectedLearnerUserId: '0',
      userName: this.props.userName,
      localInfo: new SlotInfo()
    };

    this.onAssignClicked = this.onAssignClicked.bind(this);
    this.onAtriumLearnerSelected = this.onAtriumLearnerSelected.bind(this);
    this.onAtriumUpdate = this.onAtriumUpdate.bind(this);
    this.onTurkeeSelected = this.onAtriumLearnerSelected.bind(this);

    var atriumSelf = this;
    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { atriumSelf.onCommand(payload) });
  }

  onCommand(payload) {

    let { localInfo } = this.state;

    try {

      if (payload.command === constants.SIGNALCMD_ATRIUMUPDATE) {
        log.debug(`'${localInfo.connectionId}' onCommand: ${payload.command}`);
        this.onAtriumUpdate(payload.data);
      }

    } catch (error) {
      LogError(`'${localInfo.connectionId}' onAtriumCommandCallback exception: ${error.message}`);
    }

  }

  // handle atrium contents updated
  onAtriumUpdate(payloadArray) {

    let { localInfo, atriumLearners } = this.state;

    try {

      const previousAtriumCount = atriumLearners.length;

      atriumLearners = [];

      // save atrium contents if array passed in
      if (Array.isArray(payloadArray) && (payloadArray.length >= 0)) {

        let key = 1;
        for (const payloadItem of payloadArray) {

          // make a copy of the object so it can be modified  
          var learner = Object.assign({}, payloadItem);

          // add a 'key/value' properties so atriumContents plays nicely with
          // javascript .map()
          learner.key = `${key++}`;

          atriumLearners.push(learner);
        }

        log.debug(`'${localInfo.connectionId}' onAtriumUpdate: refreshing: '${JSON.stringify(atriumLearners)}'`);

        if (previousAtriumCount != atriumLearners.length) {

          if ( this.props.onAtriumUpdate ) {
            this.props.onAtriumUpdate(atriumLearners);
          }
          
          this.setState({
            atriumLearners: atriumLearners,
            selectedLearnerUserId: '0'
          });
        }
        else {
          this.setState({
            atriumLearners: atriumLearners,
            selectedLearnerUserId: '0'
          });
        }

        this.updateAtriumState();


      }

    } catch (error) {
      LogError(`'${localInfo.connectionId}' onAtriumUpdate exception: ${error.message}`);
    }

  }

  onAssignClicked(event) {

    let { localInfo } = this.state;

    try {

      const { selectedLearnerUserId } = this.state;
      let selectedLearner = null;

      if ((selectedLearnerUserId == undefined) || (selectedLearnerUserId == '0')) {
        return;
      }

      // get unassigned atrium learner from list
      for (let item of this.state.atriumLearners) {
        if (item.userId === selectedLearnerUserId) {
          selectedLearner = item;
        }
      }

      if (!selectedLearner) {
        throw new Error(`Unable to find unassigned learner ${selectedLearnerUserId}`);
      }

      // signal the parent component of a learner assignment
      if (this.props.onAtriumAssignClicked) {
        this.props.onAtriumAssignClicked(selectedLearner);
      }

      // save atrium state to local storage
      this.updateAtriumState();

    } catch (error) {
      LogError(`'${localInfo.connectionId}' onAssignClicked exception: ${error.message}`);
    }

  }

  onAtriumLearnerSelected(event) {

    let { localInfo } = this.state;

    try {

      let {
        selectedLearnerUserId,
        atriumLearners,
        localInfo
      } = this.state;

      // test for valid turkee selected from available list
      if (event.target.value !== '0') {

        log.debug(`'${localInfo.connectionId}' onAtriumLearnerSelected: ${event.target.value}`);

        // find learner in atrium list
        for (let item of this.state.atriumLearners) {
          if (item.userId === event.target.value) {
            selectedLearnerUserId = item.userId;
          }
        }

        this.setState({ selectedLearnerUserId: selectedLearnerUserId });

        this.updateAtriumState();
      }

    } catch (error) {
      LogError(`'${localInfo.connectionId}' onAtriumLearnerSelected exception: ${error.message}`);
    }

  }

  updateAtriumState() {

    let {
      selectedLearnerUserId,
      atriumLearners,
      localInfo
    } = this.state;

    try {

      const state = {
        roomName: localInfo.roomName,
        selectedLearnerUserId,
        atriumLearners
      };

      playerState.SetAtrium(state);

    } catch (error) {
      LogError(`'${localInfo.connectionId}' updateAtriumState exception: ${error.message}`);
    }

  }

  render() {

    const {
      atriumLearners,
      selectedLearnerUserId,
    } = this.state;

    return (
      <Grid container>
        <Grid container item xs={3}>
          <FormLabel>Atrium ({atriumLearners.length} waiting)</FormLabel>
          <Select
            value={selectedLearnerUserId}
            onChange={this.onAtriumLearnerSelected}
            style={{ width: '100%' }}
          >
            <MenuItem key="0" value="0">
              <em>--Select--</em>
            </MenuItem>
            {atriumLearners.map((item) => (
              <MenuItem
                key={item.userId}
                value={item.userId}>
                {item.nickName}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid container item xs={1}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            style={{ verticalAlign: 'center', height: '30px' }}
            onClick={this.onAssignClicked}
          >
            &nbsp;Assign&nbsp;
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default Atrium;
