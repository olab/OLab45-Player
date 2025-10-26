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

    this.state = {
      ...this.state,
      responses,
    };

    // Binding this keyword
    this.setInProgress = this.setInProgress.bind(this);
    this.setValue = this.setValue.bind(this);
    this.transmitResponse = this.transmitResponse.bind(this);
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
      const baseHtmlId = `QR:${response.name}`;
      var item = (
        <div id={baseHtmlId} parentid={olabObject.baseHtmlId} key={response.id}>
          {this.buildQuestionResponse(
            olabObject,
            baseHtmlId,
            response,
            selectedIndex
          )}
        </div>
      );
      responses.push(item);
    }

    return responses;
  }

  buildQuestionResponse(olabObject, baseHtmlId, response, selectedIndex) {
    let choice = (
      <FormControlLabel
        id={`${baseHtmlId}::label`}
        value={response.id} // must be the response ID
        control={<Radio id={`${baseHtmlId}::input`} />}
        label={response.response}
        name={response.name}
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

    log.debug(`${this.constructor["name"]} '${name}' render`);

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
      const visibility = this.getDisplayStyle(olabObject);
      const divStyle = {
        display: visibility,
      };

      return (
        <div
          className={`${styles["qusinglechoice"]} ${siteStyles[id]}`}
          id={olabObject.htmlIdBase}
          olabid={olabObject.id}
          style={divStyle}
        >
          <FormControl component="fieldset" disabled={disabled}>
            <FormLabel id={`${olabObject.htmlIdBase}::stem`} component="span">
              <JsxParser jsx={olabObject.stem} />
            </FormLabel>
            <RadioGroup
              id={`${olabObject.htmlIdBase}::responses`}
              style={{ float: "left" }}
              onChange={(event) => this.setValue(event)}
              row={row}
              value={olabObject.value}
              parentid={`${olabObject.htmlIdBase}`}
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
