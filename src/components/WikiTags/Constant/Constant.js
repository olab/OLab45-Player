// @flow
import React from "react";
import parse from "html-react-parser";
import { getConstant } from "../WikiTags";
const playerState = require("../../../utils/PlayerState").PlayerState;
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

    log.debug(`OlabConstantTag render '${name}'`);

    try {
      if (constant != null) {
        if (debug.disableWikiRendering) {
          return (
            <>
              <b>
                [[CONST:{name}]] "{constant.value}"
              </b>
            </>
          );
        }

        const customId = OlabConstantTag.getConstantId(constant);

        return <span id={customId}>{parse(constant.value)}</span>;
      }

      throw new Error(`'${this.props.name}' not found`);
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
