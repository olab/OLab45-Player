// @flow
import React from "react";
import parse from "html-react-parser";
import { getConstant } from "../WikiTags";
const playerState = require("../../../utils/PlayerState").PlayerState;
import { Log, LogInfo, LogError } from "../../../utils/Logger";
import log from "loglevel";
import { Grid, TextField, Select, MenuItem, Button } from "@material-ui/core";
import { getUserSession } from "../../../services/api";
import { config } from "../../../config";
import FileSaver from "file-saver";

class OlabSessionTag extends React.Component {
  constructor(props) {
    super(props);

    const debug = playerState.GetDebug(config.APPLICATION_ID);

    this.state = {
      debug,
      mapId: this.props.props.map.id,
      userId: 0,
      issuer: "olab",
      courseDate: new Date().toISOString().substring(0, 10),
      ...props.props,
      xlsData: null,
    };
  }

  setCourseDateValue = (event) => {
    const value = event.target.value;

    log.debug(`OlabSessionTag set course date value = '${value}'.`);

    this.setState({ courseDate: value });
  };

  setUserIdValue = (event) => {
    const value = event.target.value;

    log.debug(`OlabSessionTag set user id value = '${value}'.`);

    this.setState({ userId: value });
  };

  setIssuerValue = (event) => {
    const value = event.target.value;

    log.debug(`OlabSessionTag set user id issuer value = '${value}'.`);

    this.setState({ userId: value });
  };

  concatArrayBuffers(chunks) {
    const result = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }

  onSubmitClicked = async (event) => {
    let payload = {
      mapId: 1336,
      courseDate: "2023-11-11 00:00:00",
      userId: 1,
      issuer: "olab",
    };

    const response = await getUserSession(this.props.props, payload);
    const reader = response.body.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      } else {
        chunks.push(value);
      }
    }

    var fileContents = this.concatArrayBuffers(chunks);

    var blob = new Blob([fileContents]);
    FileSaver.saveAs(blob, "session.xlsx");
  };

  render() {
    const { debug, userId, issuer, courseDate, map, xlsData } = this.state;

    const { name } = this.props;

    log.debug(`OlabSessionTag render '${name}'`);

    try {
      if (debug.disableWikiRendering) {
        return (
          <>
            <b>[[SESSION]]</b>
          </>
        );
      }

      return (
        <>
          <form>
            <Grid container justifyContent="space-around">
              <TextField
                id="mapId"
                label="Map Id"
                value={map.id}
                InputProps={{
                  readOnly: true,
                }}
                variant="filled"
              />

              <TextField
                id="date"
                label="Course Date"
                type="date"
                value={courseDate}
                onChange={(event) => this.setCourseDateValue(event)}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                id="userId"
                label="User Id"
                value={userId}
                onChange={(event) => this.setUserIdValue(event)}
              />

              <Select
                label="UserId Issuer"
                id="issuer"
                value={issuer}
                onChange={(event) => this.setIssuerValue(event)}
              >
                <MenuItem value={"olab"}>OLab</MenuItem>
                <MenuItem value={"moodle"}>Moodle</MenuItem>
              </Select>

              <Button
                variant="contained"
                color="primary"
                onClick={(event) => this.onSubmitClicked(event)}
              >
                Submit
              </Button>
            </Grid>
          </form>
        </>
      );
    } catch (error) {
      <>
        <b>[[SESSION]] "{error.message}"</b>
      </>;
    }
  }
}

export default OlabSessionTag;
