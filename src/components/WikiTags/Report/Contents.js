// @flow
import React from 'react';
import log from 'loglevel';
import { CircularProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { ReportWrapper, ReportTopSection } from './styles';
import calculateTimeTaken from '../../../helpers/calculateTimeTaken';
import { DARK_GREY } from '../../../shared/colors';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper }  from '@material-ui/core';

const playerState = require('../../../utils/PlayerState').PlayerState;

export default class OlabReportContents extends React.Component {

  constructor(props) {
    super(props);
    const debug = playerState.GetDebug();
    this.state = { debug };
  }

  render() {
    const { report } = this.props;

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

    // @Corey as I am not sure what's the criteria for extracting questions, this may need an improvement
    const questions = data.nodes.find(node => node.responses?.length > 0)?.responses || [];

    // find the counter object in data.counters array, extract its value if any
    const getCounterValue = (key, defaultValue) => {
      const counter = data.counters?.find(c => c.name == key);
      return counter != undefined ? counter.value : defaultValue;
    }

    // render report contents
    return (
      <ReportWrapper>
        <div className="report-header">
          <ReportTopSection>
            <p><strong>User:</strong> {this.props.authActions.getUserName()}</p>
            <p><strong>Session ID:</strong> {data.sessionId}</p>
            <p><strong>Map Name:</strong> {this.props.map?.name || '-'}</p>
            <p><strong>Map ID:</strong> {this.props.map?.id || '-'}</p>
            <p><strong>Start Time:</strong> {data.start}</p>
            <p><strong>Time Taken:</strong> {calculateTimeTaken(data.start, data.end)}</p>
            <p><strong>Nodes Visited:</strong> {data.nodes ? data.nodes.length : 0}</p>
          </ReportTopSection>
          <ReportTopSection>
            <p><strong>Grade:</strong> {getCounterValue('MyScore', '-')}</p>
            <p><strong>Letter Grade:</strong> {getCounterValue('LetterGrade', '-')}</p>
            <p><strong>Percentile Grade:</strong> {getCounterValue('PercentileGrade', '-')}</p>
            <p><strong>Class Average:</strong> {getCounterValue('ClassAverage', '-')}</p>
          </ReportTopSection>
        </div>

        <h3>Questions:</h3>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="Report Questions">
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Stem</strong></TableCell>
                <TableCell><strong>Response</strong></TableCell>
                <TableCell><strong>Correct</strong></TableCell>
                <TableCell><strong>Feedback</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { questions.length == 0 && <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell colSpan={5} align="center">
                    <em style={{ color: DARK_GREY }}>No questions found.</em>
                  </TableCell>
                </TableRow> }

              {questions.map((question, i) => (
                <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{question.questionId}</TableCell>
                  <TableCell>{question.questionStem || '-'}</TableCell>
                  <TableCell>{question.responseText || question.response || '-'}</TableCell>
                  <TableCell>{ 'boolean' == typeof question.isCorrect ? (
                    question.isCorrect ? 'Yes' : 'No'
                  ) : String(question.isCorrect)}</TableCell>
                  <TableCell>{question.feedback || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <p><small><strong>Checksum:</strong> {data.checkSum}</small></p>
      </ReportWrapper>
    )
  }
}
