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

    let constant = getConstant(this.props.name, this.props);
    const debug = playerState.GetDebug();
    this.state = {
      constant,
      debug,
    };
  }

  static getConstantId(constant) {
    if (constant.name != null) {
      return "CONST:" + constant.name;
    }
    return "CONST:" + constant.id;
  }

  render() {
    const { debug, constant } = this.state;

    const { name } = this.props;

    const customId = OlabConstantTag.getConstantId(this.state.constant);
    const questionDivStyle = {
      whiteSpace: "nowrap",
    };

    log.debug(`OlabConstantTag render '${name}'`);

    try {
      let item = constant; // getConstant(name, this.props);

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

        return <span id={customId}>{parse(item.value)}</span>;
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
