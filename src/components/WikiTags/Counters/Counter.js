// @flow
import React from "react";
import parse from "html-react-parser";
import log from "loglevel";

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

import { getCounters } from "../WikiUtils";
import OlabTag from "../OlabTag";

class OlabCountersTag extends OlabTag {
  constructor(props) {
    const olabObject = getCounters(
      props.props.node.id,
      props.props.dynamicObjects.counters,
      props.props.scopedObjects.map.counteractions
    );
    super(props, olabObject);
  }

  render() {
    const { olabObject, debug } = this.state;

    log.debug(`${this.constructor["name"]} render`);

    try {
      if (debug.disableWikiRendering) {
        return (
          <>
            <b>[[COUNTERS]]</b>
            <Box width="300px;">
              {olabObject.map((counter) => (
                <div key={counter.id}>
                  <b>
                    -> [[CR:{counter.name}]]: {counter.value}
                  </b>
                </div>
              ))}
            </Box>
          </>
        );
      }

      if (olabObject.length > 0) {
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
                {olabObject.map((row) => (
                  <TableRow key={row.id}>
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
      return this.errorJsx("COUNTERS", error);
    }
  }
}

export default OlabCountersTag;
