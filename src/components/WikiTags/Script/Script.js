// @flow
import React from "react";
import { getScript } from "../WikiTags";
import { OLabClientApi } from "./OLabClientApi";
const playerState = require("../../../utils/PlayerState").PlayerState;
import log from "loglevel";

class OlabScriptTag extends React.Component {
  constructor(props) {
    super(props);

    log.debug(`OlabScriptTag ctor`);

    let script = getScript(this.props.name, this.props);
    const debug = playerState.GetDebug();

    this.state = {
      script,
      ...props.props,
      debug,
    };

    this.olabClientApi = new OLabClientApi(this.props.props);
  }

  componentDidMount() {
    const { debug, script } = this.state;

    // uncomment this, to see expose html elements with id attribute
    // this.olabClientApi.getOLabObjectList();

    if (!debug.disableWikiRendering) {
      // load the script text into a function object
      // and execute it
      try {
        this.func = new Function("olabClientApi", script.source);
        this.func(this.olabClientApi);

        log.debug("script componentDidMount");
      } catch (error) {
        alert(`Script '${script.name}' error: ${error.message}`);
      }
    }
  }

  componentWillUnmount() {
    const { name } = this.props;

    log.debug(`script '${name}' componentWillUnmount`);

    delete this.func;
    this.olabClientApi.shutdown();
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
