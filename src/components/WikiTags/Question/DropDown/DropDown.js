// @flow
import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";

import CloseIcon from "@material-ui/icons/Close";
import CheckIcon from "@material-ui/icons/Check";
import Spinner from "../../../../shared/assets/loading_med.gif";
import JsxParser from "react-jsx-parser";

import { withStyles } from "@material-ui/core/styles";
import { Log, LogInfo, LogError } from "../../../../utils/Logger";
import log from "loglevel";

import styles from "../../styles.module.css";
import siteStyles from "../../site.module.css";

class OlabDropDownQuestion extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...props.props,
    };

    // Binding this keyword
    this.setInProgress = this.setInProgress.bind(this);
    this.setValue = this.setValue.bind(this);
    this.transmitResponse = this.transmitResponse.bind(this);
  }

  setValue = (event, setInProgress, setIsDisabled) => {
    const value = Number(event.target.value);
    const question = this.state.question;

    this.setState((state) => {
      question.value = value;
      log.debug(
        `OlabDropDownQuestion set question '${question.id}' value = '${value}'.`
      );
      return { question };
    });

    let response = null;

    for (let index = 0; index < this.state.question.responses.length; index++) {
      response = this.state.question.responses[index];
      if (response.id === value) {
        break;
      }
    }

    if (typeof question.responseId == "undefined")
      question.previousResponseId = null;
    else question.previousResponseId = question.responseId;

    question.responseId = response.id;
    question.value = question.responseId;

    log.debug(
      `OlabSinglePickQuestion set question '${question.id}' value = '${value}'`
    );

    // if single try question, disabled it
    if (question.numTries > 0) {
      question.disabled = true;
    }

    // first attempt to answer, so show answer
    // indicators, if called on
    question.showAnswerIndicators = true;

    this.setState({ question });
    this.transmitResponse();
  };

  transmitResponse() {
    const { onSubmitResponse, authActions, map, node, contextId } =
      this.props.props;

    let responseState = {
      ...this.state,
      authActions,
      map,
      node,
      contextId,
      setInProgress: this.setInProgress,
      setIsDisabled: this.setIsDisabled,
    };

    if (typeof onSubmitResponse !== "undefined") {
      onSubmitResponse(responseState);
    }
  }

  setInProgress(inProgress) {
    this.setState({ showProgressSpinner: inProgress });
    log.debug(`set progress spinner: ${inProgress}`);
  }

  setIsDisabled(disabled) {
    this.setState({ disabled: disabled });
    log.debug(`set disabled: ${disabled}`);
  }

  buildQuestionResponses(question, id) {
    let responses = [];
    let key = 0;
    for (const response of question.responses) {
      var item = (
        <MenuItem
          id={`${id}/QR:${response.id}`}
          key={key++}
          value={Number(response.id)}
        >
          {response.response}
        </MenuItem>
      );
      responses.push(item);
    }

    return responses;
  }

  render() {
    const { id, name, question } = this.state;

    log.debug(`OlabDropDownQuestion render '${name}'`);
    try {
      let progressButtonHtml = "";
      if (this.state.showProgressSpinner) {
        progressButtonHtml = (
          <img
            style={{ float: "left", width: 40, height: 40 }}
            src={Spinner}
            alt=""
          />
        );
      }

      var responses = this.buildQuestionResponses(question, id);
      var disabled = question.disabled == 0 ? false : true;

      return (
        <div
          className={`${styles["quddropdown"]} ${siteStyles[id]}`}
          id={`${id}`}
        >
          <Box width={question.width}>
            <FormControl fullWidth disabled={disabled}>
              <div
                id={`${id}/stem`}
                className={`${styles["qumultiline-stem"]}`}
              >
                <JsxParser jsx={question.stem} />
              </div>
              <Select
                id={`${id}/value`}
                value={question.value}
                onChange={(event) =>
                  this.setValue(event, this.setInProgress, this.setIsDisabled)
                }
                disabled={disabled}
                autowidth
              >
                <MenuItem value={0}>-- Select --</MenuItem>
                {responses}
              </Select>
            </FormControl>
          </Box>
        </div>
      );
    } catch (error) {
      return (
        <>
          <b>
            [[QU:{id}]] "{error.message}"
          </b>
        </>
      );
    }
  }
}

export default withStyles(styles)(OlabDropDownQuestion);
