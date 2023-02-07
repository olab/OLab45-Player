// @flow
import React from 'react';
import { Log, LogInfo, LogError } from '../../../utils/Logger';
import log from 'loglevel';
import hashString from '../../../helpers/hashString';
import calculateTimeTaken from '../../../helpers/calculateTimeTaken';
import { CircularProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { getSessionReport } from '../../WikiTags/WikiTags';
import { ReportWrapper, ReportTopSection } from './styles';

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
  if ( ! report?.data ) {
    return (
      <Alert severity="error" style={{ marginTop: 15 }}>Report not found.</Alert>
    );
  }

  const { data } = report;

  // render report contents
  return (
    <ReportWrapper>
      <div className="report-header">
        <ReportTopSection>
          <p><strong>User:</strong> {props.props.authActions.getUserName()}</p>
          <p><strong>Session ID:</strong> {data.sessionId}</p>
          <p><strong>Map Name:</strong> {props.props.map?.name || '-'}</p>
          <p><strong>Map ID:</strong> {props.props.map?.id || '-'}</p>
          <p><strong>Start Time:</strong> {data.start}</p>
          <p><strong>Time Taken:</strong> {calculateTimeTaken(data.start, data.end)}</p>
          <p><strong>Nodes Visited:</strong> {data.nodes ? data.nodes.length : 0}</p>
        </ReportTopSection>
        <ReportTopSection>
          <p><strong>Grade:</strong> __</p>
          <p><strong>Letter Grade:</strong> __</p>
          <p><strong>Percentile Grade:</strong> __</p>
          <p><strong>Class Average:</strong> __</p>
        </ReportTopSection>
      </div>

      <h3>Questions:</h3>

      <p><small><strong>Checksum:</strong> {data.checkSum}</small></p>
    </ReportWrapper>
  )
}