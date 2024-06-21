// @flow
import React from "react";
import { getScript } from "../WikiTags";
const playerState = require("../../../utils/PlayerState").PlayerState;
import { Log, LogInfo, LogError } from "../../../utils/Logger";
import log from "loglevel";

class OlabScriptTag extends React.Component {
  constructor(props) {
    super(props);

    let script = getScript(this.props.name, this.props);
    const debug = playerState.GetDebug();

    this.state = {
      script,
      ...props.props,
      debug,
    };
  }

  render() {
    const { debug } = this.state;
    const { name } = this.props;

    log.debug(`OlabScriptTag render '${name}'`);

    try {
      /* render it */
      if (debug.disableWikiRendering) {
        return (
          <>
            <b>[[SCRIPT:{name}]]</b>
          </>
        );
      }
    } catch (error) {
      return (
        <>
          <b>
            [[SCRIPT:{name}]] "{error.message}"
          </b>
        </>
      );
    }
  }
}

export default OlabScriptTag;
