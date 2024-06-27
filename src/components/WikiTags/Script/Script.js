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

    let script = getScript(this.props.name, this.props);
    const debug = playerState.GetDebug();

    this.state = {
      script,
      ...props.props,
      debug,
    };

    // var olabClientApi = {};
    this.olabClientApi = new OLabClientApi({
      scopedObjects: this.props.props.scopedObjects,
      dynamicObjects: this.props.props.dynamicObjects,
    });

    // this.onLoaded = this.onLoaded.bind(this);
  }

  componentDidMount() {
    const { debug, script } = this.state;

    // dump all elements with an 'id' attribute
    // for reference purposes
    var elements = document.querySelectorAll("*[id]");
    elements.forEach((element) => {
      console.log(`  ${element.id}`);
    });

    // load the script text into a function object
    // and execute it
    var func = new Function("olabClientApi", script.source);
    func(this.olabClientApi);
  }

  render() {
    const { debug, script } = this.state;
    const { name } = this.props;

    log.debug(`OlabScriptTag render '${name}'`);

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
