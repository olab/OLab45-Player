// @flow
import React from "react";
import Parser from "html-react-parser";
import log from "loglevel";
import { CircularProgress } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { ReportWrapper, ReportTopSection } from "./styles";
import calculateTimeTaken from "../../../helpers/calculateTimeTaken";
import { DARK_GREY } from "../../../shared/colors";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@material-ui/core";
import PrintIcon from "@material-ui/icons/Print";
import DownloadIcon from "@material-ui/icons/GetApp";
import { json2csvAsync } from 'json-2-csv';

const reportTableRef = React.createRef();
const reportHeaderRef = React.createRef();

export default class OlabReportContents extends React.Component {
  printReport(e) {
    e.preventDefault();
    window.print();
  }

  async exportCsvData(rows, documentName) {
    if ( 0 == rows.length )
      return;

    const csvdata = await json2csvAsync(rows)
      .catch(error => void log.error('json2csvAsync error', error) || '');

    if ( 0 == String(csvdata).trim().length )
      return;

    var a = document.createElement('a');
    a.download = documentName;
    a.href = 'data:text/csv;charset=UTF-8,' + encodeURIComponent(csvdata);
    a.dispatchEvent(new MouseEvent('click'));
  }

  async exportReportMetadaToCsv(e) {
    e.preventDefault();

    if ( ! reportHeaderRef?.current )
      return;

    const rows = [];

    reportHeaderRef.current.querySelectorAll('div > p > strong').forEach(elem =>
    {
      const text = [...elem.parentElement.childNodes].filter(n => 3 === n.nodeType)
        .map(n => n.textContent)
        .join('')
        .trim();

      const title = elem.innerText.trim().replace(/\s{0,}\:$/g, '');

      rows.push({ [title]: text });
    })

    return this.exportCsvData([Object.assign({}, ...rows)], 'Learner Report.csv');
  }

  async exportQuestionsTableToCsv(e) {
    e.preventDefault();

    if ( ! reportTableRef?.current )
      return;

    const rows = [];
    const headers = reportTableRef.current.querySelectorAll('thead > tr > th');

    reportTableRef.current.querySelectorAll('tbody > tr').forEach((tr) =>
    {
      const row = {};

      for ( let i=0; i<tr.children.length; i++ ) {
        row[headers[i].innerText] = tr.children[i].innerText;
      }

      rows.push(row);
    });

    return this.exportCsvData(rows, 'Report Questions.csv');
  }

  render() {
    const { report } = this.props;

    // loading from api or cache
    if (undefined === report) {
      return (
        <CircularProgress
          style={{
            height: 25,
            width: 25,
            marginTop: 15,
          }}
        />
      );
    }

    // invalid or no data fetched
    if (!report?.data) {
      return (
        <Alert severity="error" style={{ marginTop: 15 }}>
          Report not found.
        </Alert>
      );
    }

    const { data } = report;

    log.debug("session report data", data);

    // @Corey as I am not sure what's the criteria for extracting questions, this may need an improvement
    const questions = data.nodes
      .filter((node) => node.responses?.length > 0)
      .map((q) => q.responses || [])
      .reduce((a, b) => a.concat(b), []);

    // find the counter object in data.counters array, extract its value if any
    const getCounterValue = (name, defaultValue) => {
      const counter = data.counters?.find((c) => c.name == name);

      if (counter === undefined) log.debug(`report counter not found: ${name}`);

      return counter != undefined ? counter.value : defaultValue;
    };

    // render report contents
    return (
      <ReportWrapper>
        <div className="report-header" ref={reportHeaderRef}>
          <ReportTopSection>
            <p>
              <strong>User:</strong> {this.props.authActions.getUserName()}
            </p>
            <p>
              <strong>Session ID:</strong> {data.sessionId}
            </p>
            <p>
              <strong>Map Name:</strong> {this.props.map?.name || "-"}
            </p>
            <p>
              <strong>Map ID:</strong> {this.props.map?.id || "-"}
            </p>
            <p>
              <strong>Start Time:</strong> {data.start}
            </p>
            <p>
              <strong>Time Taken:</strong>{" "}
              {calculateTimeTaken(data.start, data.end)}
            </p>
            <p>
              <strong>Nodes Visited:</strong>{" "}
              {data.nodes ? data.nodes.length : 0}
            </p>
          </ReportTopSection>
          <ReportTopSection>
            <p>
              <strong>Grade:</strong> {getCounterValue("MyScore", "-")}
            </p>
            <p>
              <strong>Letter Grade:</strong>{" "}
              {getCounterValue("LetterGrade", "-")}
            </p>
            <p>
              <strong>Percentile Grade:</strong>{" "}
              {getCounterValue("PercentileGrade", "-")}
            </p>
            <p>
              <strong>Class Average:</strong>{" "}
              {getCounterValue("ClassAverage", "-")}
            </p>

            <div className="report-actions">
              <Button
                size="small"
                variant="outlined"
                startIcon={<PrintIcon />}
                color="primary"
                onClick={this.printReport.bind(this)}
              >
                Print
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon />}
                color="primary"
                onClick={this.exportReportMetadaToCsv.bind(this)}
              >
                Export
              </Button>
            </div>
          </ReportTopSection>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Questions</h3>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            color="primary"
            onClick={this.exportQuestionsTableToCsv.bind(this)}
          >
            Export
          </Button>
        </div>

        <TableContainer component={Paper} ref={reportTableRef}>
          <Table sx={{ minWidth: 650 }} aria-label="Report Questions">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Stem</strong>
                </TableCell>
                <TableCell>
                  <strong>Response</strong>
                </TableCell>
                <TableCell>
                  <strong>Correct</strong>
                </TableCell>
                <TableCell>
                  <strong>Feedback</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questions.length == 0 && (
                <TableRow
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell colSpan={5} align="center">
                    <em style={{ color: DARK_GREY }}>No questions found.</em>
                  </TableCell>
                </TableRow>
              )}

              {questions.map((question, i) => (
                <TableRow
                  key={i}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{question.questionId}</TableCell>
                  <TableCell>{question.questionStem || "-"}</TableCell>
                  <TableCell>
                    {Parser(question.responseText) || question.response || "-"}
                  </TableCell>
                  <TableCell>{question.correctResponse || "-"}</TableCell>
                  <TableCell>{question.feedback || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <p>
          <small>
            <strong>Checksum:</strong> {data.checkSum}
          </small>
        </p>
      </ReportWrapper>
    );
  }
}
