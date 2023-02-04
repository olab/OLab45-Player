// @flow
import React from 'react';
import { Log, LogInfo, LogError } from '../../../utils/Logger';
import log from 'loglevel';
import hashString from '../../../helpers/hashString';
import { CircularProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { getSessionReport } from '../../WikiTags/WikiTags';

const playerState = require('../../../utils/PlayerState').PlayerState;

class OlabReportTag extends React.Component {

  constructor(props) {
    super(props);
    const debug = playerState.GetDebug();
    this.state = { debug };
  }

  async componentDidMount() {
    const contextId = playerState.GetContextId(null);

    let report;

    if ( contextId ) {
      report = await this.getSessionReport(contextId);
    }

    // undefined will unset the state object
    this.setState({ report: report === undefined ? null : report })
  }

  async getSessionReport(contextId) {
    if ( ! contextId ) {
      throw new Error("Session report's contextId cannot be empty.");
    }

    const {
      debug: { disableCache=false },
    } = this.state;

    // calculate a short hash for contextId for prefixing cache keys
    const contextIdHash = hashString(contextId);

    let report = playerState.GetSessionReport(contextIdHash);

    if (report && !disableCache) {
      log.debug('using cached session report data', report);
      return report;
    }

    // fetch report data from the api endpoint
    report = await getSessionReport(this.props.props, contextId);

    if (report && !disableCache) {
      // cache valid report data for future use
      playerState.SetSessionReport(contextIdHash, report);
      log.debug(`cached session report data with suffix: ${contextIdHash}`);
    }

    return report;
  }

  render() {
    const { debug: {
      enableWikiRendering
    }, report } = this.state;

    log.debug(`OlabReportTag render`);

    try {
      if (!enableWikiRendering) {
        return (
          <>
            <b>[[REPORT]]</b>
          </>
        );
      }

      return (<Report {...this.props} report={report} />);
    }
    catch (error) {
      return (
        <>
          <b>[[REPORT]] "{error.message}"</b>
        </>
      );
    }
  }
}

export default OlabReportTag;

export const Report = (props) => {
  const { report } = props;

  // loading from api or cache
  if ( undefined === report ) {
    return (
      <CircularProgress style={{
        height: 25,
        width: 25,
        marginTop: 15,
      }} />
    );
  }

  // invalid or no data fetched
  if ( ! report ) {
    return (
      <Alert severity="error" style={{ marginTop: 15 }}>Report not found.</Alert>
    );
  }

  // render report contents
  return (
    <>
      <h3>Session Report</h3>
      <p><small>checksum: {report.session.checkSum}</small></p>
    </>
  )
}