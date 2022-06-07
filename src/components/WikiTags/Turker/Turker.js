// @flow
import * as React from 'react';
import {
    Button, Grid, FormLabel, Table, TableBody, MenuItem,
    TableCell, Select,
    TableRow
} from '@material-ui/core';
import log from 'loglevel';
import { withStyles } from '@material-ui/core/styles';
import { HubConnectionState } from '@microsoft/signalr';

import Chat from '../../Chat/Chat'
import Turker from '../../../services/turker';
import styles from '../styles.module.css';
import PropManager from './PropManager'

class OlabModeratorTag extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            connectionInfos: [],
            connectionStatus: '',
            maxHeight: 200,
            selectedUnassignedTurkee: '0',
            unassignedTurkeeList: [],
            userName: props.props.authActions.getUserName(),
            width: '100%',
        };

        this.onUpdateUnassignedList = this.onUpdateUnassignedList.bind(this);
        this.onTurkeeSelected = this.onTurkeeSelected.bind(this);
        this.onAssignClicked = this.onAssignClicked.bind(this);
        this.onConnectionChanged = this.onConnectionChanged.bind(this);

        this.turker = new Turker(this);
        this.turker.connect(this.state.userName);

        // this defines the max number of turkees
        // for the turker
        this.MAX_TURKEES = 8;
        this.NUM_ROWS = 2;

        this.propManager = new PropManager(this.MAX_TURKEES, { Name: this.state.userName, ConnectionId: '' });
        this.state.connectionInfos = this.propManager.getProps();

    }

    // applies changes to connection status
    onConnectionChanged(connectionInfo) {

        if (connectionInfo.connectionStatus === HubConnectionState.Connected) {
            this.propManager.setConnectionId(connectionInfo.ConnectionId);
        }
        else {
            this.propManager.setConnectionId('');
        }

        let {
            connectionInfos
        } = this.state;

        connectionInfos = this.propManager.getProps();

        this.setState({
            connectionInfos: connectionInfos,
            connectionStatus: connectionInfo.connectionStatus,
            localInfo: {
                ConnectionId: connectionInfo.ConnectionId,
                Name: connectionInfo.Name
            }
        });
    }

    onTurkeeSelected(event) {

        // test for valid turkee selected from available list
        if (event.target.value !== '0') {

            log.debug(`onTurkeeSelected: ${event.target.value}`);
            this.setState({ selectedUnassignedTurkee: event.target.value });
        }
    }

    onAssignClicked(event) {

        try {

            const { selectedUnassignedTurkee } = this.state;
            let selectedTurkeeInfo = null;

            // get unassigned turkee from list
            for (let index = 0; index < this.state.unassignedTurkeeList.length; index++) {
                const element = this.state.unassignedTurkeeList[index];
                if (element.PartnerId === selectedUnassignedTurkee) {
                    selectedTurkeeInfo = element;
                }
            }

            if (!selectedTurkeeInfo) {
                throw new Error(`Unable to find unassigned turkee ${selectedUnassignedTurkee}`);
            }

            // signal server with assignment of turkee to turker
            this.turker.onAssignTurkee(selectedTurkeeInfo);
            // add turkee to chat component
            this.assignTurkeeToChat(selectedTurkeeInfo);

        } catch (error) {
            log.error(`onAssignClicked exception: ${error.message}`);
        }

    }

    assignTurkeeToChat(turkeeInfo) {

        try {

            let {
                connectionInfos
            } = this.state;

            this.propManager.assignTurkee(turkeeInfo);
            connectionInfos = this.propManager.getProps();

            this.setState({ connectionInfos: connectionInfos });

        } catch (error) {
            log.error(`assignTurkeeToChat exception: ${error.message}`);
        }
    }

    onUpdateUnassignedList(turkees) {

        try {

            let {
                unassignedTurkeeList
            } = this.state;

            // handle no turkees waiting when turker connects
            if (Array.isArray(turkees) && (turkees.length === 0)) {
                this.setState({
                    unassignedTurkeeList: [],
                    selectedUnassignedTurkee: '0'
                });
                return;
            }

            // handle turkees already waiting when turker connects
            else if (Array.isArray(turkees) && (turkees.length >= 0)) {
                unassignedTurkeeList = turkees;
            }

            // add a 'key' property so unassignedTurkeeList plays nicely with
            // javascript .map()
            unassignedTurkeeList.forEach((element, index) => {
                unassignedTurkeeList[index].key = element.PartnerId;
            });

            log.debug(`onUpdateUnassignedList: ${JSON.stringify(unassignedTurkeeList, null, 2)}`);

            this.setState({
                unassignedTurkeeList: unassignedTurkeeList,
            });

        } catch (error) {
            log.error(`onUpdateUnassignedList exception: ${error.message}`);
        }

    }

    generateLeftStatusString() {

        if (this.turker.connection._connectionState === HubConnectionState.Connected) {
            return `${this.state.connectionStatus} (Id: ${this.turker.connection.connectionId.substring(0, 3)})`;
        }

        return this.state.connectionStatus;

    }

    render() {

        const {
            connectionInfos,
            connectionStatus,
            unassignedTurkeeList,
            selectedUnassignedTurkee,
            userName
        } = this.state;

        log.debug(`OlabTurkerTag render '${userName}'`);

        const tableLayout = { border: '1px solid black', backgroundColor: '#3333' };
        const cellStyling = { padding: 7 }

        try {
            return (
                <Grid container item xs={12}>
                    <Table style={tableLayout}>
                        <TableBody>
                            <TableRow>
                                <TableCell style={cellStyling}>
                                    <Chat
                                        connectionStatus={connectionStatus}
                                        connection={this.turker.connection}
                                        localInfo={connectionInfos[0].localInfo}
                                        remoteInfo={connectionInfos[0].remoteInfo}
                                        playerProps={this.props.props} />
                                </TableCell>
                                <TableCell style={cellStyling}>
                                    <Chat
                                        connectionStatus={connectionStatus}
                                        connection={this.turker.connection}
                                        localInfo={connectionInfos[1].localInfo}
                                        remoteInfo={connectionInfos[1].remoteInfo}
                                        playerProps={this.props.props} />
                                </TableCell>
                                <TableCell style={cellStyling}>
                                    <Chat
                                        connectionStatus={connectionStatus}
                                        connection={this.turker.connection}
                                        localInfo={connectionInfos[2].localInfo}
                                        remoteInfo={connectionInfos[2].remoteInfo}
                                        playerProps={this.props.props} />
                                </TableCell>
                                <TableCell style={cellStyling}>
                                    <Chat
                                        connectionStatus={connectionStatus}
                                        connection={this.turker.connection}
                                        localInfo={connectionInfos[3].localInfo}
                                        remoteInfo={connectionInfos[3].remoteInfo}
                                        playerProps={this.props.props} />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={cellStyling}>
                                    <Chat
                                        connectionStatus={connectionStatus}
                                        connection={this.turker.connection}
                                        localInfo={connectionInfos[4].localInfo}
                                        remoteInfo={connectionInfos[4].remoteInfo}
                                        playerProps={this.props.props} />
                                </TableCell>
                                <TableCell style={cellStyling}>
                                    <Chat
                                        connectionStatus={connectionStatus}
                                        connection={this.turker.connection}
                                        localInfo={connectionInfos[5].localInfo}
                                        remoteInfo={connectionInfos[5].remoteInfo}
                                        playerProps={this.props.props} />
                                </TableCell>
                                <TableCell style={cellStyling}>
                                    <Chat
                                        connectionStatus={connectionStatus}
                                        connection={this.turker.connection}
                                        localInfo={connectionInfos[6].localInfo}
                                        remoteInfo={connectionInfos[6].remoteInfo}
                                        playerProps={this.props.props} />
                                </TableCell>
                                <TableCell style={cellStyling}>
                                    <Chat
                                        connectionStatus={connectionStatus}
                                        connection={this.turker.connection}
                                        localInfo={connectionInfos[7].localInfo}
                                        remoteInfo={connectionInfos[7].remoteInfo}
                                        playerProps={this.props.props} />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>

                    <Grid container>
                        <Grid container item xs={3}>
                            <FormLabel>Unassigned Learners ({unassignedTurkeeList.length} waiting)</FormLabel>
                            <Select
                                value={selectedUnassignedTurkee}
                                onChange={this.onTurkeeSelected}
                                style={{ width: '100%' }}
                            >
                                <MenuItem key="0" value="0">
                                    <em>--Select--</em>
                                </MenuItem>
                                {unassignedTurkeeList.map((turkee) => (
                                    <MenuItem key={turkee.PartnerId} value={turkee.PartnerId}>{turkee.PartnerName} ({turkee.PartnerId.substring(0, 3)})</MenuItem>
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
                </Grid>
            );

        } catch (error) {
            return (
                <>
                    <b>[[MODERATOR]] "{error.message}"</b>
                </>
            );
        }
    }

}

export default withStyles(styles)(OlabModeratorTag);
