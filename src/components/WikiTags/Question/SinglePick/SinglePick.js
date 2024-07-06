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

import { getQuestion } from "../../WikiTags";
import { postQuestionValue } from "../../../../services/api";
const playerState = require("../../../../utils/PlayerState").PlayerState;

class OlabSinglePickQuestion extends React.Component {
  constructor(props) {
    super(props);

    log.debug(`${this.constructor["name"]} ctor`);

    let question = getQuestion(this.props.name, this.props);
    var responses = this.buildQuestionResponses(question, this.props.id);
    const debug = playerState.GetDebug();

    this.state = {
      debug,
      question,
      ...props.props,
      responses,
    };

    // Binding this keyword
    this.setInProgress = this.setInProgress.bind(this);
    this.setValue = this.setValue.bind(this);
    this.transmitResponse = this.transmitResponse.bind(this);
  }

  componentWillUnmount() {
    log.debug(
      `${this.constructor["name"]} '${this.state.question.name}' componentWillUnmount`
    );
  }

  setInProgress(inProgress) {
    this.setState({ showProgressSpinner: inProgress });
    log.debug(`set progress spinner: ${inProgress}`);
  }

  setIsDisabled(disabled) {
    this.setState({ disabled: disabled });
    log.debug(`set disabled: ${disabled}`);
  }

  setValue = (event) => {
    const value = Number(event.target.value);
    let question = this.state.question;

    log.debug(
      `${this.constructor["name"]}  set question '${question.id}' value = '${value}'.`
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
      `${this.constructor["name"]}  set question '${question.id}' value = '${value}'`
    );

    // if single try question, disabled it
    if (question.numTries > 0) {
      question.disabled = true;
    }

    // first attempt to answer, so show answer
    // indicators, if called on
    question.showAnswerIndicators = true;

    this.setState(
      (state) => {
        question = question;
        return { question };
      },
      () => this.transmitResponse()
    );

    // this.setState({ question });
    // this.transmitResponse();
  };

  transmitResponse() {
    const { authActions, map, node, contextId } = this.props.props;

    let responseState = {
      ...this.state,
      authActions,
      map,
      node,
      contextId,
      setInProgress: this.setInProgress,
      setIsDisabled: this.setIsDisabled,
    };

    this.onSubmitResponse(responseState);
  }

  buildQuestionResponses(question, id) {
    let responses = [];
    let key = 0;
    let selectedIndex = null;

    if (question.value) {
      selectedIndex = Number(question.value);
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
    const { debug, question, responses } = this.state;
    const { id, name } = this.props;

    log.debug(`${this.constructor["name"]} render`);

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

      if (debug.disableWikiRendering) {
        return (
          <>
            <b>
              [[{id}]] ({question.id})
            </b>
          </>
        );
      }

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
            [[{id}]] error "{error.message}"
          </b>
        </>
      );
    }
  }

  onSubmitResponse = async (newState) => {
    // send question response to server and get the
    // new dynamic objects state
    var { data } = await postQuestionValue(newState);

    // bubble up the dynamic object to player since the
    // dynamic objects may be shared to other components
    if (data != null && this.props.props.onUpdateDynamicObjects) {
      this.props.props.onUpdateDynamicObjects(data);
      this.setInProgress(false);
    }
  };
}

export default withStyles(styles)(OlabSinglePickQuestion);
