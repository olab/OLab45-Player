// @flow
import React from "react";
import {
  Box,
  Paper,
  TableContainer,
  Table,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@material-ui/core";
import log from "loglevel";
import { getCounters } from "../WikiTags";
import { config } from "../../../config";

const playerState = require("../../../utils/PlayerState").PlayerState;

class OlabCountersTag extends React.Component {
  constructor(props) {
    super(props);

    const counters = getCounters(
      this.props.props.node.id,
      this.props.props.dynamicObjects.map.counters,
      this.props.props.scopedObjects.map.counteractions
    );
    const debug = playerState.GetDebug();

    this.state = {
      id: this.props.props.id,
      name: this.props.props.name,
      question: this.props.props.question,
      authActions: this.props.props.authActions,
      onSubmitResponse: this.props.props.onSubmitResponse,
      showProgressSpinner: false,
      disabled: false,
      map: this.props.props.map,
      node: this.props.props.node,
      counterActions: this.props.props.scopedObjects.map.counteractions,
      debug,
      counters,
    };
  }

  render() {
    log.debug(`OlabCountersTag render`);

    try {
      const { counters, counterActions, node, debug } = this.state;

      if (debug.disableWikiRendering) {
        return (
          <>
            <b>[[COUNTERS]]</b>
            <Box width="300px;">
              {counters.map((counter) => (
                <p>
                  &nbsp;
                  <b>
                    [[CR:{counter.name}]]: {counter.value}
                  </b>
                </p>
              ))}
            </Box>
          </>
        );
      }

      if (counters.length > 0) {
        return (
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Scope (Id)</TableCell>
                  <TableCell align="right">Name (Id)</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="right">Last Update</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {counters.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      {row.scopeLevel} ({row.parentId})
                    </TableCell>
                    <TableCell align="right">
                      {row.name} ({row.id})
                    </TableCell>
                    <TableCell align="right">{row.value}</TableCell>
                    <TableCell align="right">{row.updatedat}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }

      return <></>;
    } catch (error) {
      log.error(`OlabMediaResourceTag render error: ${error}`);
      return (
        <>
          <b>[[COUNTERS]] "{error.message}"</b>
        </>
      );
    }
  }
}

export default OlabCountersTag;
