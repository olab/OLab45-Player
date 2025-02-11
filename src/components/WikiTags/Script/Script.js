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

  componentDidMount() {
    this.loadSnippet();
  }

  updateObject(newObject) {
    log.debug(`updating object`);
    this.props.props.onUpdateScopedObjects(newObject);
  }

  loadSnippet = async () => {
    try {
      const { debug, olabObject } = this.state;

      const response = await fetch(
        "https://olabfiles.blob.core.windows.net/files/Maps/1451/scriptTest.html"
      );
      const snippet = await response.text();
      const container = document.getElementById("snippetContainer");
      if (container) {
        container.innerHTML = snippet;
        // Evaluate scripts within the snippet
        const scriptTags = container.getElementsByTagName("script");
        for (let i = 0; i < scriptTags.length; i++) {
          eval(scriptTags[i].innerText); // Caution: use eval carefully
        }
      }
    } catch (error) {
      console.error("Error loading snippet:", error);
    }
  };

  render() {
    const { debug, script } = this.state;
    const { name } = this.props;

    log.debug(`OlabScriptTag render '${name}'`);

    try {
      if (script == null) {
        throw new Error(`'${this.props.name}' not found`);
      }

      if (debug.disableWikiRendering) {
        return (
          <>
            <br />
            <b>[[SCRIPT:{name}]]</b>
            <br />
            <textarea rows="10" cols="50" defaultValue={script.source} />
            <br />
            <br />
          </>
        );
      }

      return (
        <div id="snippetContainer">
          {/* The HTML snippet will be loaded here */}
        </div>
      );
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
