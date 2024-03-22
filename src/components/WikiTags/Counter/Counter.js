// @flow
import React from "react";
import parse from "html-react-parser";
import { Log, LogInfo, LogError } from "../../../utils/Logger";
import log from "loglevel";
import { getCounter } from "../WikiTags";
const playerState = require("../../../utils/PlayerState").PlayerState;
import { config } from "../../../config";

class OlabCounterTag extends React.Component {
  constructor(props) {
    super(props);

    const debug = playerState.GetDebug();
    this.state = { debug };
  }

  render() {
    const { debug } = this.state;

    const { name } = this.props;

    log.debug(`OlabConstantTag render '${name}'`);

    try {
      let item = getCounter(name, this.props.props.dynamicObjects);

      if (item != null) {
        if (debug.disableWikiRendering) {
          return (
            <>
              <b>
                [[CR:{name}]] "{item.value}"
              </b>
            </>
          );
        }

        if (item.value == null) {
          item.value = "";
        }

        return <>{parse(item.value)}</>;
      }
    } catch (error) {
      return (
        <>
          <b>
            [[CR:{name}]] "{error.message}"
          </b>
        </>
      );
    }

    return "";
  }
}

export default OlabCounterTag;
