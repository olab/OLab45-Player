// @flow
import * as React from 'react';
import log from 'loglevel';
import { withStyles } from '@material-ui/core/styles';

import Chat from '../../Chat/Chat'
import Turkee from '../../../services/turkee';
import styles from '../styles.module.css';
import TurkeeChatStatusBar from './TurkeeChatStatusBar';
const persistantStorage = require('../../../utils/StateStorage').PersistantStateStorage;

class OlabAttendeeTag extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      connectionStatus: '',
      localInfo: { Name: null, ConnectionId: null, RoomName: null },
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

  // the sessionId has changed
  onSessionIdChanged(Id) {

    let {
      localInfo
    } = this.state;

    localInfo.Id = Id;

    this.setState({
      localInfo: localInfo
    });
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
  onRoomAssigned(payloadData) {

    try {
      log.debug(`onRoomAssigned: setting room: '${payloadData}'`);

      let {
        localInfo        
      } = this.state;

      localInfo.RoomName = payloadData;
      localInfo.groupName = payloadData;
      localInfo.connected = true;

      this.setState({
        localInfo: localInfo
      });

      let connectionInfo = persistantStorage.get('connectionInfo');
      if ( connectionInfo != null ) {
        localInfo.RoomName = connectionInfo.RoomName
      }
      else {
        connectionInfo = {
          RoomName: localInfo.RoomName
        };
      }

      persistantStorage.save('connectionInfo', connectionInfo);
  
    } catch (error) {
      log.error(`onRoomAssigned exception: ${error.message}`);
    }

  }

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
      localInfo,
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
            learnerInfo={localInfo}
            playerProps={this.props.props} />
          <TurkeeChatStatusBar
            sessionId={sessionId}
            connection={this.turkee.connection}
            connectionStatus={connectionStatus}
            localInfo={localInfo}
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
