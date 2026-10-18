// @flow
import React, { PureComponent } from "react";
import {
  Button,
  Grid,
  FormControl,
  TextField,
  List,
  ListItem,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import Spinner from "../../shared/assets/loading_med.gif";
import { Log, LogInfo, LogError } from "../../utils/Logger";
import log from "loglevel";
import styles from "./styles";
import { importer } from "../../services/api";
import styled from "styled-components";

const DebugDiv = styled.div`
  color: #000000;
`;

const InfoDiv = styled.div`
  color: #7f7f7f;
`;

const ErrorDiv = styled.div`
  color: #ff0000;
`;

class Import extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      fileName: "",
      importRunning: false,
      messages: [],
    };
  }

  runImporter = async (props, state) => {
    try {
      this.setState({
        importRunning: true,
        messages: [],
      });

      const data = await importer(props.props, state.fileName);

      for (let index = 0; index < data.data.messages.length; index++) {
        data.data.messages[index].key = index;
      }

      this.setState({
        messages: data.data.messages,
      });
    } catch (error) {
      LogError(error);
    }

    this.setState({ importRunning: false });
  };

  onFileNameChanged = (event) => {
    const value = event.target.value;
    let fileName = this.state.fileName;

    var r1 = /\\/;
    var r2 = /\//;
    if (value.search(r1) !== -1 || value.search(r2) !== -1) {
      return;
    }

    this.setState((state) => {
      fileName = value;
      return { fileName };
    });
  };

  onImportClicked = (event) => {
    this.runImporter(this.props, this.state);
  };

  render() {
    const { fileName, messages, importRunning } = this.state;

    log.debug(`Import render`);

    try {
      let progressButtonHtml = "";
      if (importRunning) {
        progressButtonHtml = (
          <img
            style={{ float: "left", width: 40, height: 40 }}
            src={Spinner}
            alt=""
          />
        );
      }

      return (
        <div id={`import`}>
          <FormControl component="fieldset">
            <h5>Case Importer</h5>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  id="standard-basic"
                  variant="standard"
                  value={fileName}
                  onChange={this.onFileNameChanged}
                />
              </Grid>
              <Grid item xs={1}>
                <Button
                  onClick={(event) => this.onImportClicked(event)}
                  variant="outlined"
                >
                  Import
                </Button>
              </Grid>
            </Grid>
          </FormControl>
          {progressButtonHtml}
          <List disablePadding>
            {messages.map((listItem) => (
              <ListItem>
                {listItem.levelStr === "Error" && (
                  <ErrorDiv>{listItem.message}</ErrorDiv>
                )}
                {listItem.levelStr === "Debug" && (
                  <DebugDiv>{listItem.message}</DebugDiv>
                )}
                {listItem.levelStr === "Info" && (
                  <InfoDiv>
                    <b>{listItem.message}</b>
                  </InfoDiv>
                )}
                {listItem.levelStr === "Warn" && (
                  <InfoDiv>
                    <b>{listItem.message}</b>
                  </InfoDiv>
                )}
              </ListItem>
            ))}
          </List>
        </div>
      );
    } catch (error) {
      return (
        <>
          <b>{error.message}</b>
        </>
      );
    }
  }
}

export default withStyles(styles)(Import);
