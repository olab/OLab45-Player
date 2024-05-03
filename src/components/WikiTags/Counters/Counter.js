// @flow
import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  TableContainer,
  Table,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@material-ui/core";
import { Log, LogInfo, LogError } from "../../../utils/Logger";
import log from "loglevel";
import { getCounters } from "../WikiTags";
import { config } from "../../../config";

const playerState = require("../../../utils/PlayerState").PlayerState;

class OlabCountersTag extends React.Component {
  constructor(props) {
    super(props);

    const debug = playerState.GetDebug();

    this.state = {
      id: props.props.id,
      name: props.props.name,
      question: props.props.question,
      authActions: props.props.authActions,
      onSubmitResponse: props.props.onSubmitResponse,
      showProgressSpinner: false,
      disabled: false,
      map: props.props.map,
      node: props.props.node,
      counterActions: props.props.scopedObjects.map.counteractions,
      debug,
    };
  }

  render() {
    log.debug(`OlabCountersTag render`);

    try {
      const { counterActions, node, debug } = this.state;

      let counters = getCounters(
        node.id,
        this.props.props.dynamicObjects.map.counters,
        counterActions
      );

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
          <TableContainer id={`COUNTERS`} component={Paper}>
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
                    <TableCell align="right">
                      <span id={`COUNTERS:CR:${row.name}`}>{row.value}</span>
                    </TableCell>
                    <TableCell align="right">{row.updatedat}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
        // return (
        //   <div className={`${styles['counters']} ${siteStyles['counters']}`}>
        //     <Box width="300px;">
        //       <List component="span" dense={true}>
        //         {counters.map((counter) => (
        //           <ListItem>
        //             <ListItemText
        //               primary={`${counter.name}: ${counter.value}`}
        //             />
        //           </ListItem>
        //         ))}
        //       </List>
        //     </Box>
        //   </div>
        // );
      }

      return <></>;
    } catch (error) {
      LogError(`OlabMediaResourceTag render error: ${error}`);
      return (
        <>
          <b>[[COUNTERS]] "{error.message}"</b>
        </>
      );
    }
  }
}

export default OlabCountersTag;
