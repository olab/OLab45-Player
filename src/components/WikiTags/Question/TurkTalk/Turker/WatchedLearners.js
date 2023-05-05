const playerState = require("../../../../../utils/PlayerState").PlayerState;
import log from "loglevel";

class WatchedLearners {
  constructor(mapId, question) {
    let questionSettings = JSON.parse(question.settings);
    let { roomName: roomId } = questionSettings;

    this.watchProfileKey = `${mapId}/${roomId}`;
    this.watchProfile = playerState.GetWatchProfile(this.watchProfileKey);
  }

  SetWatchedLearners(watchLearners) {
    this.watchProfile.watchLearners = watchLearners;
    playerState.SetWatchProfile(this.watchProfileKey, this.watchProfile);
    log.debug(
      `new watchedLearners: ${JSON.stringify(
        this.watchProfile.watchLearners,
        null,
        2
      )}`
    );
  }

  SetAutoAssign(value) {
    this.watchProfile.autoAssign = value;
    playerState.SetWatchProfile(this.watchProfileKey, this.watchProfile);
    log.debug(`new autoAssign: ${value}`);
  }
}

export default WatchedLearners;
