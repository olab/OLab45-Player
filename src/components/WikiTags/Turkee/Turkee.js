// @flow
import * as React from 'react';
import log from 'loglevel';
import { withStyles } from '@material-ui/core/styles';
import {
  Table,
  TableBody,
  TableRow
} from '@material-ui/core';

import Turkee from '../../../services/turkee';
import styles from '../styles.module.css';
import ChatCell from '../ChatCell/ChatCell'
import SlotInfo from '../../../helpers/SlotInfo';
import SlotManager from '../ChatCell/SlotManager';
var constants = require('../../../services/constants');
const persistantStorage = require('../../../utils/StateStorage').PersistantStateStorage;

class OlabAttendeeTag extends React.Component {

  constructor(props) {

    super(props);

    this.propManager = new SlotManager(1);
    // this makes the chat and status bar
    // components visible
    this.propManager.Slots()[0].show = true;

    this.state = {
      connectionStatus: null,
      slotInfos: this.propManager.Slots(),
      maxHeight: 200,
      remoteInfo: new SlotInfo(),
      localInfo: new SlotInfo({ connectionId: '???' }),
      userName: props.props.authActions.getUserName(),
      width: '100%',
      id: this.props.name,
      contextId: props.props.contextId
    };

    this.turkee = new Turkee(this);
    this.turkee.connect(this.state.userName);
    this.connection = this.turkee.connection;
    this.connectionId = '';

    this.onAtriumAssigned = this.onAtriumAssigned.bind(this);

    var self = this;
    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { self.onCommandCallback(payload) });

  }

  onCommandCallback(payload) {

    try {

      log.debug(`'${this.connectionId}' onTurkeeCommandCallback: ${payload.command}`);

      if (payload.command === constants.SIGNALCMD_ROOMASSIGNED) {
        this.onRoomAssigned(payload.data);
      }

      else if (payload.command === constants.SIGNALCMD_ATRIUMASSIGNED) {
        this.onAtriumAssigned(payload.data);
      }

      else {
        log.debug(`'${this.connectionId}' onTurkeeCommandCallback unknown command: '${payload.command}'`);
      }

    } catch (error) {
      log.error(`'${this.connectionId}' onTurkeeCommandCallback exception: ${error.message}`);
    }

  }

  // learner has been assigned to an atrium
  onAtriumAssigned(learner) {

    learner.isModerator = false;
    learner.show = true;

    this.propManager.assignLocalInfo(learner);
    var localInfo = this.propManager.LocalSlots()[0];
    localInfo.connectionId = localInfo.connectionId.slice(-3);

    log.debug(`'${this.connectionId}' onAtriumAssigned localInfo = ${JSON.stringify(localInfo, null, 2)}]`);
    persistantStorage.save('connectionInfo', localInfo);

    this.setState({
      localInfo: localInfo
    });


  }

  onRoomAssigned(payload) {

    try {

      let {
        userName
      } = this.state;

      // ignore any messages not to me
      if (userName !== payload.local.userId) {
        return false;
      }

      var slotInfo = this.propManager.Slots()[0];
      slotInfo.SetParticipant(payload.local);
      slotInfo.assigned = true;
      slotInfo.show = true;

      this.setState({
        localInfo: slotInfo
      });

      log.debug(`'${this.connectionId}' onRoomAssigned localInfo = ${JSON.stringify(slotInfo, null, 2)}]`);

      persistantStorage.save('connectionInfo', slotInfo);

    } catch (error) {
      log.error(`'${this.connectionId}' onRoomAssigned exception: ${error.message}`);
    }

  }

  componentDidMount() {
    this.componentMounted = true;
  }

  async componentWillUnmount() {

    log.debug(`'${this.connectionId}' OlabAttendeeTag unmounting`);

    this.componentMounted = false;

    if (this.turkee) {
      await this.turkee.disconnect();
      this.turkee = null;
    }
  }

  // the contextId has changed
  oncontextIdChanged(Id) {

    let { chatInfo } = this.state;

    chatInfo.Id = Id;

    this.setState({ chatInfo });
  }

  // applies changes to connection status
  onConnectionChanged(connectionInfo) {

    let { remoteInfo, localInfo } = this.state;
    localInfo.connectionId = connectionInfo.connectionId;

    this.setState({
      connectionStatus: connectionInfo,
      remoteInfo: remoteInfo
    });

    this.connectionId = connectionInfo.connectionId;

  }

  render() {

    const {
      id,
      connectionStatus,
      remoteInfo,
      localInfo,
      userName
    } = this.state;

    const tableLayout = { border: '2px solid black', backgroundColor: '#3333', width: '100%' };

    log.debug(`'${localInfo.connectionId}' OlabTurkeeTag render '${userName}'`);

    try {

      if (persistantStorage.get('dbg-disableWikiRendering')) {
        return (
          <>
            [[ATTENDEE:{remoteInfo.RoomName}]]
          </>
        );
      }

      // prevent anything interesting happening
      // until we are connected
      if (!connectionStatus) {
        return (<></>);
      }

      return (
        <>
          <Table style={tableLayout}>
            <TableBody>
              <ChatCell
                key={0}
                isModerator={localInfo.isModerator}
                style={{ width: '100%' }}
                connection={this.connection}
                localInfo={localInfo}
                senderInfo={remoteInfo}
                playerProps={this.props.props} />
            </TableBody>
          </Table>
          <br />
        </>
      );

    } catch (error) {
      return (
        <>
          <b>[[ATTENDEE:{id}]] "{error.message}"</b>
        </>
      );
    }
  }

}

export default withStyles(styles)(OlabAttendeeTag);
