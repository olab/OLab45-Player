// @flow
import React from "react";
import { getScript } from "../WikiTags";
import { OLabClientApi } from "./OLabClientApi";
const playerState = require("../../../utils/PlayerState").PlayerState;
import { Log, LogInfo, LogError } from "../../../utils/Logger";
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

    this.olabClientApi = new OLabClientApi({
      scopedObjects: this.props.props.scopedObjects,
      dynamicObjects: this.props.props.dynamicObjects,
    });
  }

  componentDidMount() {
    const { debug, script } = this.state;

    // uncomment this, to see expose html elements with id attribute
    // this.olabClientApi.getOLabObjectList();

    // load the script text into a function object
    // and execute it
    try {
      this.func = new Function("olabClientApi", script.source);
      this.func(this.olabClientApi);

      Log("script componentDidMount");
    } catch (error) {
      alert(`Script '${script.name}' error: ${error.message}`);
    }
  }

  componentWillUnmount() {
    Log("script componentWillUnmount");
    delete this.func;

    this.olabClientApi.shutdown();
  }

  render() {
    const { debug, script } = this.state;
    const { name } = this.props;

    Log(`OlabScriptTag render '${name}'`);

    try {
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

      return <></>;
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
