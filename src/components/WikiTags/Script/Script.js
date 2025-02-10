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
    this.olabClientApi = new OLabClientApi(this);
  }

  render() {
    const { name } = this.props;

    log.debug(`OlabScriptTag render '${name}'`);

    try {
      if (debug.disableWikiRendering) {
        return (
          <>
            <br />
            <b>[[SCRIPT:{name}]]</b>
            <br />
            <textarea rows="10" cols="50" />
            <br />
            <br />
          </>
        );
      }

      // Load the external HTML file containing the div
      this.olabClientApi.loadExternalDiv(
        "https://olabfiles.blob.core.windows.net/files/Maps/1451/scriptTest.html",
        "content"
      );

      return <div id="content"></div>;
    } catch (error) {
      return (
        <>
          <b>
            [[SCRIPT:{name}]] error: {error.message}
          </b>
        </>
      );
    }
  }
}

export default OlabScriptTag;
