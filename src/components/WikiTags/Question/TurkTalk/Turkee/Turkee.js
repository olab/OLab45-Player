// @flow
import * as React from 'react';
import log from 'loglevel';
import { withStyles } from '@material-ui/core/styles';
import {
  Table,
  TableBody,
  TableRow
} from '@material-ui/core';

import Turkee from '../../../../../services/turkee';
import styles from '../../../styles.module.css';
import ChatCell from '../../../../ChatCell/ChatCell'
import SlotInfo from '../../../../../helpers/SlotInfo';
import SlotManager from '../SlotManager';
import Session from '../../../../../services/session';

var constants = require('../../../../../services/constants');
const persistantStorage = require('../../../../../utils/StateStorage').PersistantStateStorage;

class OlabAttendeeTag extends React.Component {

  constructor(props) {

    super(props);

    this.slotManager = new SlotManager(1);
    // this makes the chat and status bar
    // components visible
    this.slotManager.RemoteSlots()[0].show = true;

    let session = new Session(props.props);

    this.state = {
      connectionStatus: null,
      slotInfos: this.slotManager.RemoteSlots(),
      maxHeight: 200,
      remoteInfo: new SlotInfo(),
      localInfo: new SlotInfo({ connectionId: '???' }),
      userName: props.props.authActions.getUserName(),
      width: '100%',
      id: this.props.name,
      session: session
    };

    this.turkee = new Turkee(this);
    this.turkee.connect(this.state.userName);
    this.connection = this.turkee.connection;
    this.connectionId = '';

    this.onAtriumAssigned = this.onAtriumAssigned.bind(this);

    var turkeeSelf = this;
    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { turkeeSelf.onCommandCallback(payload) });

  }

  dumpConnectionState() {
    var infoState = { localInfo: this.state.localInfo, remoteInfo: null };
    log.debug(`'${this.connectionId}' onAtriumAssigned localInfo = ${JSON.stringify(infoState, null, 2)}]`);
    persistantStorage.save('infoState', infoState);
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
  onAtriumAssigned(payload) {

    try {

      let { userName } = this.state;

      // ignore any messages not to me
      if (userName !== payload.userId) {
        return false;
      }

      payload.isModerator = false;
      payload.show = true;
      payload.connectionId = payload.connectionId.slice(-3);

      this.slotManager.assignLocalInfo(payload);
      var localInfo = this.slotManager.LocalSlots()[0];

      this.setState({
        localInfo: localInfo,
        remoteInfo: null
      });

      this.dumpConnectionState();

    } catch (error) {
      log.error(`'${this.connectionId}' onAtriumAssigned exception: ${error.message}`);
    }

  }

  onRoomAssigned(payload) {

    try {

      let { userName } = this.state;

      // ignore any messages not to me
      if (userName !== payload.local.userId) {
        return false;
      }

      const { localInfo } = this.state;
      let { remoteSlots, localSlots } = this.slotManager.assignLearner(localInfo, payload.remote);

      this.setState({
        showChatGrid: true,
        localInfo: localSlots[0],
        remoteInfo: remoteSlots[0]
      });

      this.dumpConnectionState();

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
      userName,
      session
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
          {this.props.props.question.stem}
          <Table style={tableLayout}>
            <TableBody>
              <TableRow>
                <ChatCell
                  key={0}
                  isModerator={localInfo.isModerator}
                  style={{ width: '100%' }}
                  connection={this.connection}
                  localInfo={localInfo}
                  senderInfo={remoteInfo}
                  session={session}
                  playerProps={this.props.props} />
              </TableRow>
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
