// @flow
import React from "react";
import parse from "html-react-parser";
import log from "loglevel";

import { getConstant } from "../WikiTags";
const playerState = require("../../../utils/PlayerState").PlayerState;

class OlabConstantTag extends React.Component {
  constructor(props) {
    super(props);

    log.debug(`${this.constructor["name"]} ctor`);

    let constant = getConstant(this.props.name, this.props);
    const debug = playerState.GetDebug();

    this.state = {
      constant,
      debug,
      ...props.props,
    };
  }

  render() {
    const { debug, constant } = this.state;
    const { id, name } = this.props;

    log.debug(`${this.constructor["name"]} render`);

    try {
      if (constant != null) {
        if (debug.disableWikiRendering) {
          return (
            <>
              <b>
                [[{id}]] ({constant.id}) "{parse(constant.value)}"
              </b>
            </>
          );
        }

        return <span id={name}>{parse(constant.value)}</span>;
      }

      throw new Error(`'${this.props.name}' not found`);
    } catch (error) {
      return (
        <>
          <b>
            [[{id}]] error "{error.message}"
          </b>
        </>
      );
    }
  }
}

export default OlabConstantTag;
