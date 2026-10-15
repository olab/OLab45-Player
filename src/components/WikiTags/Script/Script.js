// @flow
import React from "react";
const playerState = require("../../../utils/PlayerState").PlayerState;
import log from "loglevel";

import { OLabClientApi } from "./OLabClientApi";
import { getScript } from "../WikiUtils";
import OlabTag from "../OlabTag";

class OlabScriptTag extends OlabTag {
  constructor(props) {
    let olabObject = getScript(props.name, props);
    super(props, olabObject);

    this.state.olabClientApi = new OLabClientApi(this);
  }

  componentDidMount() {
    const { olabObject, olabClientApi } = this.state;
    if (
      typeof olabObject?.scriptSource !== "string" ||
      !olabObject.scriptSource.trim()
    ) {
      return;
    }

    try {
      const runScript = new Function(
        "api",
        "document",
        olabObject.scriptSource,
      );
      runScript(olabClientApi, document);
    } catch (error) {
      log.error(`Script '${this.props.name}' failed:`, error);
    }
  }
}

export default OlabScriptTag;
