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

  loadSnippet = async () => {
    try {
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
    return (
      <div id="snippetContainer">
        {/* The HTML snippet will be loaded here */}
      </div>
    );
  }
}

export default OlabScriptTag;
