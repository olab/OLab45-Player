// const playerState = require("../../../../../utils/PlayerState").PlayerState;
import { PlayerState } from "../../../../../utils/PlayerState";
const playerState = new PlayerState();

import log from "loglevel";

class WatchedLearners {
  constructor(mapId, question) {
    try {
      let questionSettings = JSON.parse(question.settings);
      let { roomName: roomId } = questionSettings;

      this.watchProfileKey = `${mapId}/${roomId}`;
      this.watchProfile = PlayerState.GetWatchProfile(this.watchProfileKey);

      log.debug(
        `current watchProfile: ${JSON.stringify(this.watchProfile, null, 2)}`
      );
    } catch (error) {
      log.error(`WatchedLearners ctor exception: ${error.message}`);
    }
  }

  FindWatchedLearner(userId) {
    let learner = null;

    this.watchProfile.watchedLearners.forEach((watchedLearner) => {
      if (watchedLearner.userId === userId) {
        learner = watchedLearner;
      }
    });

    return learner;
  }

  RemoveWatchedLearner(userId) {
    try {
      let newArray = [];
      this.watchProfile.watchedLearners.forEach((watchedLearner) => {
        if (watchedLearner.userId != userId) {
          newArray.push(watchedLearner);
        }
      });

      this.SetWatchedLearners(newArray);
    } catch (error) {
      log.error(`RemoveWatchedLearner exception: ${error.message}`);
    }
  }

  SetWatchedLearners(watchedLearners) {
    try {
      this.watchProfile.watchedLearners = watchedLearners;
      PlayerState.SetWatchProfile(this.watchProfileKey, this.watchProfile);
      log.debug(
        `new watchedLearners: ${JSON.stringify(
          this.watchProfile.watchedLearners,
          null,
          2
        )}`
      );
    } catch (error) {
      log.error(`SetWatchedLearners exception: ${error.message}`);
    }
  }

  SetAutoAssign(value) {
    this.watchProfile.autoAssign = value;
    PlayerState.SetWatchProfile(this.watchProfileKey, this.watchProfile);
    log.debug(`new autoAssign: ${value}`);
  }
}

export default WatchedLearners;
