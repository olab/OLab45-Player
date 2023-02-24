class Session {
  constructor(source = null) {
    this.contextId = source?.contextId;
    this.mapId = source?.map?.id;
    this.nodeId = source?.node?.id;
    this.questionId = source?.question?.id;
    this.roomName = null;
  }
}

export default Session;
