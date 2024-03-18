// @flow
import React from "react";
import { Log, LogInfo, LogError } from "../../../utils/Logger";
import log from "loglevel";
import { getSessionReport } from "../../../services/api";
import OlabReportContents from "./Contents";
import { config } from "../../../config";

const playerState = require("../../../utils/PlayerState").PlayerState;

class OlabReportTag extends React.Component {
  constructor(props) {
    super(props);
    const debug = playerState.GetDebug(config.APPLICATION_ID);
    this.state = { debug };
  }

  async componentDidMount() {
    const contextId = playerState.GetContextId(null);

    let report;

    if (contextId) {
      report = await getSessionReport(this.props.props, contextId);
    }

    const debug = playerState.GetDebug(config.APPLICATION_ID);

    // undefined will unset the state object
    this.setState({
      debug: debug,
      report: report === undefined ? null : report,
    });
  }

  render() {
    const { debug, report } = this.state;

    log.debug(`OlabReportTag render`);

    try {
      if (debug.disableWikiRendering) {
        return (
          <>
            <b>[[REPORT]]</b>
          </>
        );
      }

      return <OlabReportContents {...this.props.props} report={report} />;
    } catch (error) {
      return (
        <>
          <b>[[REPORT]] "{error.message}"</b>
        </>
      );
    }
  }
}

export default OlabReportTag;
