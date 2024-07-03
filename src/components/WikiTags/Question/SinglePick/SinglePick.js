// @flow
import React from "react";
import {
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  FormControl,
} from "@material-ui/core";

import CloseIcon from "@material-ui/icons/Close";
import CheckIcon from "@material-ui/icons/Check";

import { withStyles } from "@material-ui/core/styles";
import log from "loglevel";
import JsxParser from "react-jsx-parser";

import styles from "../../styles.module.css";
import siteStyles from "../../site.module.css";
import Spinner from "../../../../shared/assets/loading_med.gif";

class OlabSinglePickQuestion extends React.Component {
  constructor(props) {
    super(props);

    log.debug(`${this.constructor["name"]} ctor`);

    this.state = {
      ...props.props,
    };

    // Binding this keyword
    this.setInProgress = this.setInProgress.bind(this);
    this.setValue = this.setValue.bind(this);
    this.transmitResponse = this.transmitResponse.bind(this);
  }

  setValue = (event) => {
    const value = Number(event.target.value);
    const question = this.state.question;

    log.debug(
      `OlabSinglePickQuestion set question '${question.id}' value = '${value}'.`
    );

    let response = null;

    // if value corresponds to a response id, match it to a response
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
    question.valueOverride = response.response;

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
    let selectedIndex = null;

    if (this.state.question.value) {
      selectedIndex = Number(this.state.question.value);
    }

    for (const response of question.responses) {
      var item = (
        <div id={`${id}::QR:${response.name}`} key={key++}>
          {this.buildQuestionResponse(question, id, response, selectedIndex)}
        </div>
      );
      responses.push(item);
    }

    return responses;
  }

  buildQuestionResponse(question, id, response, selectedIndex) {
    let choice = (
      <FormControlLabel
        id={`${id}::QR:${response.name}::label`}
        value={response.id}
        control={<Radio id={`${id}::QR:${response.name}::value`} />}
        label={response.response}
      />
    );

    let feedback = null;
    if (selectedIndex == response.id) {
      feedback = response.feedback;
    }

    let correctnessIndicator = <></>;

    if (question.showAnswer) {
      // check if response is selected, meaning we display
      // is_correct and feedback.
      if (selectedIndex == response.id) {
        // test for 'correct' answer
        if (response.isCorrect == 1 && question.showAnswerIndicators) {
          correctnessIndicator = (
            <>
              <CheckIcon style={{ color: "green" }} />
              {feedback}
            </>
          );
        }

        // test for 'incorrect' answer
        if (response.isCorrect == -1 && question.showAnswerIndicators) {
          correctnessIndicator = (
            <>
              <CloseIcon style={{ color: "red" }} />
              {feedback}
            </>
          );
        }
      }
    }

    return (
      <div id={`${id}::QR:${response.name}`} name={response.name}>
        {choice}
        {correctnessIndicator}
      </div>
    );
  }

  render() {
    const { id, name, question } = this.state;

    log.debug(`OlabSinglePickQuestion render '${name}'`);

    try {
      let row = question.layoutType === 1 ? true : false;

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
          className={`${styles["qusinglechoice"]} ${siteStyles[id]}`}
          id={`${id}`}
        >
          <FormControl component="fieldset" disabled={disabled}>
            <FormLabel id={`${id}::stem`} component="legend">
              <JsxParser jsx={question.stem} />
            </FormLabel>
            <RadioGroup
              id={`${id}::QR`}
              style={{ float: "left" }}
              onChange={(event) => this.setValue(event)}
              row={row}
              value={question.value}
            >
              {responses}
            </RadioGroup>
            {progressButtonHtml}
          </FormControl>
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

export default withStyles(styles)(OlabSinglePickQuestion);
