import TurkTalk from './turktalk';
import log from 'loglevel';
var constants = require('./constants');

class Turker extends TurkTalk {

  // *****
  constructor(component) {

    super(component);

    const { onUpdateUnassignedList, onAddTurkee, onRemoveTurkey } = component;
    this.onUpdateUnassignedList = onUpdateUnassignedList;
    this.onAddTurkee = onAddTurkee;
    this.onRemoveTurkey = onRemoveTurkey;
    this.playerState = component.props.props;
    this.penName = `${component.props.props.map.name}|${component.props.name}`;

    this.onAssignTurkee = this.onAssignTurkee.bind(this);
    this.onCommandCallback = this.onCommandCallback.bind(this);
    this.onDisconnected = this.onDisconnected.bind(this);

    this.bindConnectionMessage();

  }

  // *****
  bindConnectionMessage() {

    super.bindConnectionMessage()
    var self = this;

    this.connection.on(constants.SIGNALCMD_COMMAND, (payload) => { self.onCommandCallback(payload) });
  }

  // *****
  connect(username) {
    this.username = username;
    super.connect(this);
  }

  // *****
  onConnected(clientObject) {

    log.info(`onConnected: connection succeeded.  Id = '${this.connection.connectionId}'`);

    this.connectionId = this.connection.connectionId;

    this.connection.onclose(clientObject.onDisconnected);
    this.connection.onreconnecting(clientObject.onReconnecting);
    this.connection.onreconnected(clientObject.onReconnected);

    if (this.component.onConnectionChanged) {
      this.component.onConnectionChanged({
        connectionStatus: this.connection._connectionState,
        ConnectionId: this.connectionId,
        Name: this.username
      });
    }

    clientObject.connection.send(constants.SIGNALCMD_REGISTERTURKER, clientObject.username, this.penName);

  }

  onReconnecting(error) {
    try {
      log.debug(`onReconnecting: ${error}`);
      if (this.component.onConnectionChanged) {
        this.component.onConnectionChanged({
          connectionStatus: this.connection._connectionState,
          ConnectionId: this.connectionId,
          Name: this.username
        });
      }
    } catch (error) {
      log.error(`onReconnecting exception: ${error.message}`);
    }
  }

  onReconnected(connectionId) {
    try {
      log.debug(`onReconnected: ${connectionId}`);
      if (this.component.onConnectionChanged) {
        this.component.onConnectionChanged({
          connectionStatus: this.connection._connectionState,
          ConnectionId: this.connectionId,
          Name: this.username
        });
      }
    } catch (error) {
      log.error(`onReconnected exception: ${error.message}`);
    }
  }

  // *****
  onDisconnected() {

    try {
      log.debug(`onDisconnected`);
      if (this.component.onConnectionChanged) {
        this.component.onConnectionChanged({
          connectionStatus: this.connection._connectionState,
          ConnectionId: '',
          Name: this.username
        });
      }

    } catch (error) {
      log.error(`onDisconnected exception: ${error.message}`);
    }

  }

  onAssignTurkee(turkeeInfo) {

    log.debug(`onAssignTurkee: turkee = '${JSON.stringify(turkeeInfo, null, 2)}' `);
    this.connection.send(constants.SIGNALCMD_ASSIGNTURKEE, turkeeInfo, this.penName);
  }

  // *****
  onCommandCallback(payloadJson) {

    try {

      let payload = JSON.parse(payloadJson);

      log.debug(`onCommandCallback: ${payload.Command}, ${JSON.stringify(payload.Data, null, 2)}]`);

      // test if command NOT handled in base class
      if (super.onCommandCallback(payload)) {
        return;
      }

      if (payload.Command === constants.SIGNALCMD_TURKEES) {

        if (this.onUpdateUnassignedList) {
          this.onUpdateUnassignedList(payload.Data);
        }
      }

    } catch (error) {
      log.error(`onCommandCallback exception: ${error.message}`);
    }

  }

  // sendMessage(senderInfo, message) {

  //   log.debug(`sendMessage: '${message}' sendInfo = ${JSON.stringify(senderInfo)}`);

  //   if (senderInfo.InSession) {

  //     const payload = {
  //       senderInfo: senderInfo,
  //       message: message
  //     };

  //     this.connection.send(constants.SIGNALCMD_MESSAGE, payload);
  //   }
  //   else {
  //     log.error(`sendMessage: not connected.  Send ignored.`);
  //   }
  // }

};

export default Turker;
