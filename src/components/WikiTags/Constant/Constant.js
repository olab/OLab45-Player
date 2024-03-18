// @flow
import React from "react";
import parse from "html-react-parser";
import { getConstant } from "../WikiTags";
const playerState = require("../../../utils/PlayerState").PlayerState;
import { Log, LogInfo, LogError } from "../../../utils/Logger";
import log from "loglevel";
import { config } from "../../../config";

class OlabConstantTag extends React.Component {
  constructor(props) {
    super(props);

    const debug = playerState.GetDebug(config.APPLICATION_ID);
    this.state = { debug };
  }

  render() {
    const { debug } = this.state;

    const { name } = this.props;

    log.debug(`OlabConstantTag render '${name}'`);

    try {
      let item = getConstant(name, this.props);

      if (item != null) {
        if (debug.disableWikiRendering) {
          return (
            <>
              <b>
                [[CONST:{name}]] "{item.value}"
              </b>
            </>
          );
        }

        return <>{parse(item.value)}</>;
      }
    } catch (error) {
      return (
        <>
          <b>
            [[CONST:{name}]] "{error.message}"
          </b>
        </>
      );
    }
  }
}

export default OlabConstantTag;
