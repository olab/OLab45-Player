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
            localInfo: { Name: '', ConnectionId: '' },
            maxHeight: 200,
            remoteInfo: { Name: '', ConnectionId: '', RoomName: props.name },
            userName: props.props.authActions.getUserName(),
            width: '100%',
            id: this.props.name,
        };

        this.turkee = new Turkee(this);
        this.turkee.connect(this.state.userName);
    }

    // applies changes to connection status
    onConnectionChanged(connectionInfo) {

        this.setState({
            connectionStatus: connectionInfo.connectionStatus,
            localInfo: connectionInfo
        });
    }

    // applies changes to remote info for conversation
    onAssigned(remoteInfo) {

        this.setState({
            remoteInfo: remoteInfo
        });

    }

    render() {

        const {
            id,
            localInfo,
            remoteInfo,
            connectionStatus,
            userName,
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
                        connectionStatus={connectionStatus}
                        localInfo={localInfo}
                        remoteInfo={remoteInfo}
                        playerProps={this.props.props} />
                    <TurkeeChatStatusBar
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
