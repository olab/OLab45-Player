// @flow
import * as React from 'react';
import log from 'loglevel';
import { withStyles } from '@material-ui/core/styles';

import Chat from '../../Chat/Chat'
import Turkee from '../../../services/turkee';
import styles from '../styles.module.css';
import TurkeeChatStatusBar from './TurkeeChatStatusBar';
const persistantStorage = require('../../../utils/StateStorage').PersistantStateStorage;
// import Participant from '../../../helpers/participant';
import SlotInfo from '../../../helpers/SlotInfo';

class OlabAttendeeTag extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      connectionStatus: '',
      chatInfo: new SlotInfo(),
      maxHeight: 200,
      remoteInfo: { Name: '', ConnectionId: '', RoomName: props.name },
      userName: props.props.authActions.getUserName(),
      width: '100%',
      id: this.props.name,
      sessionId: ''
    };

    this.turkee = new Turkee(this);
    this.turkee.connect(this.state.userName);

    this.onAtriumAssigned = this.onAtriumAssigned.bind(this);

  }

  componentDidMount() { 
    this.componentMounted = true;
  }

  async componentWillUnmount() {

    log.debug(`OlabAttendeeTag unmounting`);

    this.componentMounted = false;

    if ( this.turkee ) {
      await this.turkee.disconnect();
      this.turkee = null;
    }
  }

  // the sessionId has changed
  onSessionIdChanged(Id) {

    let { chatInfo } = this.state;

    chatInfo.Id = Id;

    this.setState({ chatInfo });
  }

  // applies changes to connection status
  onConnectionChanged(connectionInfo) {

    let {
      remoteInfo
    } = this.state;

    remoteInfo.RoomName = connectionInfo.RoomName;

    this.setState({
      connectionStatus: connectionInfo.connectionStatus,
      localInfo: connectionInfo,
      remoteInfo: remoteInfo
    });
  }

  // applies changes to remote info for conversation
  onRoomAssigned(payload) {

    try {

      log.debug(`onRoomAssigned: setting room: '${[payload]}'`);

      let slot = new SlotInfo( { assigned: true, show: true });
      slot.SetParticipant(payload);

      // this.setState({
      //   slotInfo: slot
      // });

      persistantStorage.save('connectionInfo', slot);

    } catch (error) {
      log.error(`onRoomAssigned exception: ${error.message}`);
    }

  }

  // learner has been assigned to an atrium
  onAtriumAssigned(learner) {

    learner.assignedTo = "atrium";
    persistantStorage.save('connectionInfo', learner);
    this.setState({
      learnerInfo: learner
    });
  }

  render() {

    const {
      id,
      chatInfo,
      remoteInfo,
      connectionStatus,
      userName,
      sessionId
    } = this.state;

    log.debug(`OlabTurkeeTag render '${userName}'`);

    try {

      if (persistantStorage.get('dbg-disableWikiRendering')) {
        return (
          <>
            [[ATTENDEE:{remoteInfo.RoomName}]]
          </>
        );
      }

      return (
        <>
          <Chat
            connection={this.turkee.connection}
            chatInfo={chatInfo}
            playerProps={this.props.props} />
          <TurkeeChatStatusBar
            sessionId={sessionId}
            connection={this.turkee.connection}
            connectionStatus={connectionStatus}
            localInfo={chatInfo}
            remoteInfo={remoteInfo} />
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
