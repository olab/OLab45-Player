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

import { getQuestion } from "../../WikiUtils";
import OlabTag from "../../OlabTag";
const playerState = require("../../../../utils/PlayerState").PlayerState;

class OlabSinglePickQuestion extends OlabTag {
  constructor(props) {
    let olabObject = getQuestion(props.name, props);
    super(props, olabObject);

    var responses = this.buildQuestionResponses(olabObject, this.props.id);
    const debug = playerState.GetDebug();

    this.state = {
      debug,
      olabObject,
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
      `${this.constructor["name"]} '${this.state.olabObject.name}' componentWillUnmount`
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
    let olabObject = this.state.olabObject;

    log.debug(
      `${this.constructor["name"]}  set question '${olabObject.id}' value = '${value}'.`
    );

    let response = null;

    // if value corresponds to a response id, match it to a response
    for (
      let index = 0;
      index < this.state.olabObject.responses.length;
      index++
    ) {
      response = this.state.olabObject.responses[index];
      if (response.id === value) {
        break;
      }
    }

    if (typeof olabObject.responseId == "undefined")
      olabObject.previousResponseId = null;
    else olabObject.previousResponseId = olabObject.responseId;

    olabObject.responseId = response.id;
    olabObject.value = olabObject.responseId;
    olabObject.valueOverride = response.response;

    log.debug(
      `${this.constructor["name"]}  set question '${olabObject.id}' value = '${value}'`
    );

    // if single try question, disabled it
    if (olabObject.numTries > 0) {
      olabObject.disabled = true;
    }

    // first attempt to answer, so show answer
    // indicators, if called on
    olabObject.showAnswerIndicators = true;

    this.setState(
      (state) => {
        olabObject = olabObject;
        return { olabObject };
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

  buildQuestionResponses(olabObject, id) {
    let responses = [];
    let selectedIndex = null;

    if (olabObject.value) {
      selectedIndex = Number(olabObject.value);
    }

    for (const response of olabObject.responses) {
      var item = (
        <div
          id={`QR:${response.id}`}
          name={response.name}
          parentId={olabObject.htmlIdBase}
          key={response.id}
        >
          {this.buildQuestionResponse(olabObject, id, response, selectedIndex)}
        </div>
      );
      responses.push(item);
    }

    return responses;
  }

  buildQuestionResponse(olabObject, id, response, selectedIndex) {
    let choice = (
      <FormControlLabel
        id={`QR:${response.id}::label`}
        value={response.id}
        control={<Radio id={`QR:${response.id}::input`} />}
        label={response.response}
      />
    );

    let feedback = null;
    if (selectedIndex == response.id) {
      feedback = response.feedback;
    }

    let correctnessIndicator = <></>;

    if (olabObject.showAnswer) {
      // check if response is selected, meaning we display
      // is_correct and feedback.
      if (selectedIndex == response.id) {
        // test for 'correct' answer
        if (response.isCorrect == 1 && olabObject.showAnswerIndicators) {
          correctnessIndicator = (
            <>
              <CheckIcon style={{ color: "green" }} />
              {feedback}
            </>
          );
        }

        // test for 'incorrect' answer
        if (response.isCorrect == -1 && olabObject.showAnswerIndicators) {
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
      <div>
        {choice}
        {correctnessIndicator}
      </div>
    );
  }

  render() {
    const { debug, olabObject, responses } = this.state;
    const { id, name } = this.props;

    log.debug(`${this.constructor["name"]} render`);

    try {
      let row = olabObject.layoutType === 1 ? true : false;

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
              [[{id}]] ({olabObject.id})
            </b>
          </>
        );
      }

      var disabled = olabObject.disabled == 0 ? false : true;

      return (
        <div
          className={`${styles["qusinglechoice"]} ${siteStyles[id]}`}
          id={olabObject.htmlIdBase}
          name={olabObject.name}
        >
          <FormControl component="fieldset" disabled={disabled}>
            <FormLabel id={`${olabObject.htmlIdBase}::stem`} component="legend">
              <JsxParser jsx={olabObject.stem} />
            </FormLabel>
            <RadioGroup
              id={`${olabObject.htmlIdBase}::QR`}
              style={{ float: "left" }}
              onChange={(event) => this.setValue(event)}
              row={row}
              value={olabObject.value}
            >
              {responses}
            </RadioGroup>
            {progressButtonHtml}
          </FormControl>
        </div>
      );
    } catch (error) {
      return this.errorJsx(id, error);
    }
  }
}

export default withStyles(styles)(OlabSinglePickQuestion);
