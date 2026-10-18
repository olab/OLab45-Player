// @flow
import React, { useEffect, useState } from "react";
import { PlayerState as playerState } from "../../../utils/PlayerState";
import log from "loglevel";

import { OLabClientApi } from "./OLabClientApi";
import { getScript } from "../WikiUtils";
import OlabTag from "../OlabTag";

import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-javascript";

class OlabScriptTag extends OlabTag {
  constructor(props) {
    let olabObject = getScript(props.name, props);
    super(props, olabObject);

    this.state.olabClientApi = new OLabClientApi(this);
    this.codeRef = React.createRef();
  }

  componentDidMount() {
    Prism.highlightAll();

    const { olabObject, olabClientApi } = this.state;
    if (typeof olabObject?.source !== "string" || !olabObject.source.trim()) {
      return;
    }

    try {
      const runScript = new Function(
        "olab",
        "document",
        "player",
        olabObject.source,
      );
      runScript(olabClientApi, document, this.olabPlayer);
    } catch (error) {
      log.error(`Script '${olabObject.name}(${olabObject.id})' failed:`, error);
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.state.olabClientApi.shutdown();
  }

  render() {
    const { debug, olabObject } = this.state;
    const { id, name } = this.props;

    if (debug.disableWikiRendering) {
      return (
        <>
          <b>
            [[{id}]] ({olabObject.id})
            <pre>
              <code ref={this.codeRef} className="language-javascript">
                {olabObject.source}
              </code>
            </pre>
          </b>
        </>
      );
    }

    return <></>;
  }
}

export default OlabScriptTag;
