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
    console.log("OlabScriptTag mounted");
    this.loadSnippet();
  }

  componentWillUnmount() {
    console.log("OlabScriptTag unmounted");
    this.state.olabClientApi.shutdown();
  }

  updateObject(newObject) {
    log.debug(`updating object`);
    this.player.onUpdateObjects(newObject);
  }

  updateScopedObject(newObject) {
    log.debug(`updating scoped object`);
    this.player.onUpdateScopedObjects(newObject);
  }

  updateDynamicObject(newCounters) {
    log.debug(`updating dynamic counters`);
    this.player.onUpdateDynamicObjects(newCounters);
  }

  loadSnippet = async () => {
    try {
      const { debug, olabObject } = this.state;

      var url = olabObject.originUrl;
      if (olabObject.hostName != null) {
        url = `${olabObject.hostName}${url}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(response.status);
      }

      const snippet = await response.text();

      const container = document.getElementById("snippetContainer");
      if (container) {
        container.innerHTML = snippet;

        // Evaluate scripts within the snippet
        const scriptTags = container.getElementsByTagName("script");

        for (let i = 0; i < scriptTags.length; i++) {
          eval(scriptTags[i].innerText);
        }
      }
    } catch (error) {
      console.error("Error loading snippet:", error);
    }
  };

  render() {
    const { debug, olabObject } = this.state;
    const { name } = this.props;

    log.debug(`OlabScriptTag render '${name}'`);

    try {
      if (olabObject == null) {
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
