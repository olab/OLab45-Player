// @flow
import React from "react";
import parse from "html-react-parser";
import log from "loglevel";
import { getCounter } from "../WikiTags";
const playerState = require("../../../utils/PlayerState").PlayerState;
import { config } from "../../../config";

class OlabCounterTag extends React.Component {
  constructor(props) {
    super(props);

    let counter = getCounter(this.props.name, this.props.props.dynamicObjects);

    const debug = playerState.GetDebug();

    this.state = {
      counter,
      debug,
    };
  }

  render() {
    const { debug, counter } = this.state;
    const { name } = this.props;

    log.debug(`OlabCounterTag render '${name}'`);

    try {
      if (counter != null) {
        if (debug.disableWikiRendering) {
          return (
            <>
              <b>
                [[CR:{name}]] "{counter.value}"
              </b>
            </>
          );
        }

        if (counter.value == null) {
          counter.value = "";
        }

        return <>{parse(counter.value)}</>;
      }

      throw new Error(`'${name}' not found`);
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
