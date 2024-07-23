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
    const { debug, olabObject } = this.state;

    // uncomment this, to see html elements with id attribute
    // dumped to the console
    // this.olabClientApi.getOLabObjectList();

    if (!debug.disableWikiRendering) {
      // load the script text into a function object
      // and execute it
      try {
        this.func = new Function("olabClientApi", olabObject.source);
        this.func(this.olabClientApi);

        log.debug("script componentDidMount");
      } catch (error) {
        alert(`Script '${olabObject.name}' error: ${error.message}`);
      }
    }
  }

  componentWillUnmount() {
    const { name } = this.props;

    log.debug(`script '${name}' componentWillUnmount`);

    delete this.func;
    this.olabClientApi.shutdown();
  }

  updateObject(newObject) {
    log.debug(`updating object`);
    this.props.props.onUpdateScopedObjects(newObject);
  }

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
        <div id={script.name} style={{ display: "none" }}>
          script
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
