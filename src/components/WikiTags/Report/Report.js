// @flow
import React from "react";
import { Log, LogInfo, LogError } from "../../../utils/Logger";
import log from "loglevel";
import { getSessionReport } from "../../../services/api";
import OlabReportContents from "./Contents";

const playerState = require("../../../utils/PlayerState").PlayerState;

class OlabReportTag extends React.Component {
  constructor(props) {
    super(props);
    const debug = playerState.GetDebug();
    this.state = { debug };
  }

  async componentDidMount() {
    const contextId = playerState.GetContextId(null);

    let report;

    if (contextId) {
      report = await getSessionReport(this.props.props, contextId);
    }

    // undefined will unset the state object
    this.setState({ report: report === undefined ? null : report });
  }

  render() {
    const {
      debug: { enableWikiRendering },
      report,
    } = this.state;

    log.debug(`OlabReportTag render`);

    try {
      if (!enableWikiRendering) {
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
