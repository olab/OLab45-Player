// @flow
import React from "react";
import {
  FormControlLabel,
  FormLabel,
  FormGroup,
  Checkbox,
  FormControl,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import log from "loglevel";
import JsxParser from "react-jsx-parser";

import CloseIcon from "@material-ui/icons/Close";
import CheckIcon from "@material-ui/icons/Check";

import styles from "../../styles.module.css";
import siteStyles from "../../site.module.css";
import Spinner from "../../../../shared/assets/loading_med.gif";

import { getQuestion } from "../../WikiUtils";
import OlabTag from "../../OlabTag";

// const playerState = require("../../../../utils/PlayerState").PlayerState;
import { PlayerState } from "../../../../utils/PlayerState";
const playerState = new PlayerState();

class OlabMultiPickQuestion extends OlabTag {
  constructor(props) {
    let olabObject = getQuestion(props.name, props);
    super(props, olabObject);

    const debug = PlayerState.GetDebug();

    this.state = {
      debug,
      olabObject,
      ...props.props,
      hasInitialAnswer: false,
    };

    // Binding this keyword
    this.setInProgress = this.setInProgress.bind(this);
    this.setValue = this.setValue.bind(this);
    this.transmitResponse = this.transmitResponse.bind(this);
  }

  createArrayFromValue(source) {
    if (!source.includes(",") && !source.length) {
      return [];
    }

    if (!source.includes(",") && source.length) {
      return [source];
    }

    return source.split(",");
  }

  createValueFromArray(source) {
    if (source.length === 1) {
      return source[0];
    } else {
      return source.toString();
    }
  }

  setValue = (event, choiceArray, choiceId) => {
    const olabObject = this.state.olabObject;

    if (choiceArray == null) {
      choiceArray = [];
    }

    let value = null;
    let valueOverride;
    const checked = event.target.checked;
    const alreadyContains = choiceArray.includes(choiceId);

    if (checked && choiceArray.length === 0) {
      value = choiceId;
      valueOverride = olabObject.responses.find(
        (res) => res.id == choiceId
      )?.response;
    } else {
      if (!checked && alreadyContains) {
        const index = choiceArray.indexOf(choiceId);
        if (index > -1) {
          choiceArray.splice(index, 1);
        }
      } else if (checked && !alreadyContains) {
        choiceArray.push(choiceId);
      }

      value = this.createValueFromArray(choiceArray);
      valueOverride = this.createValueFromArray(
        olabObject.responses
          .filter((res) => choiceArray.map((n) => +n).includes(res.id))
          .map((res) => res.response)
      );
    }

    log.debug(
      `${this.constructor["name"]} set question '${olabObject.id}' value = '${value}'`
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
        olabObject.previousValue = olabObject.value;
        olabObject.value = value;
        olabObject.valueOverride = valueOverride;
        return { olabObject };
      },
      () => this.transmitResponse()
    );

    if (event.relatedTarget) {
      setTimeout(function () {
        log.debug(`focus ${event.relatedTarget.id}`);
        event.relatedTarget.focus();
      }, 500);
    }
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

  buildQuestionResponses(olabObject, id, currentChoices) {
    let responses = [];
    let selectedIndexStrings = [];

    if (olabObject.value) {
      selectedIndexStrings = olabObject.value.split(",");
    }

    let selectedIndexes = selectedIndexStrings.map((item) => Number(item));

    for (const response of olabObject.responses) {
      const baseHtmlId = `QR:${response.name}`;

      var item = (
        <div id={baseHtmlId} parentid={olabObject.htmlIdBase} key={response.id}>
          {this.buildQuestionResponse(
            olabObject,
            baseHtmlId,
            response,
            currentChoices,
            selectedIndexes
          )}
        </div>
      );
      responses.push(item);
    }

    return responses;
  }

  buildQuestionResponse(
    olabObject,
    baseHtmlId,
    response,
    currentChoices,
    responseIndexes
  ) {
    let correctnessIndicator = <>{response.response}</>;
    let feedback = null;

    if (responseIndexes.includes(response.id)) {
      feedback = response.feedback;
    }

    if (olabObject.showAnswer) {
      // check if response is selected, meaning we display
      // is_correct and feedback.
      if (currentChoices.includes(`${response.id}`)) {
        // test for 'correct' answer
        if (response.isCorrect == 1 && olabObject.showAnswerIndicators) {
          correctnessIndicator = (
            <>
              {response.response}
              <CheckIcon style={{ color: "green" }} />
              {feedback}
            </>
          );
        }

        // test for 'incorrect' answer
        if (response.isCorrect == -1 && olabObject.showAnswerIndicators) {
          correctnessIndicator = (
            <>
              {response.response}
              <CloseIcon style={{ color: "red" }} />
              {feedback}
            </>
          );
        }
      }
    }

    let responseHtml = (
      <FormControlLabel
        id={`${baseHtmlId}::label`}
        onChange={(event) =>
          this.setValue(event, currentChoices, response.id.toString())
        }
        key={response.id}
        control={
          <Checkbox
            id={`QR:${response.name}::input`}
            name={`${response.response.replace(/\W/g, "")}`}
          />
        }
        label={correctnessIndicator}
        checked={currentChoices.includes(response.id.toString())}
      />
    );

    return responseHtml;
  }

  render() {
    const { debug, olabObject } = this.state;
    const { id, name } = this.props;

    log.debug(`${this.constructor["name"]} '${name}' render`);

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

      if (debug.disableWikiRendering) {
        return (
          <>
            <b>
              [[{id}]] ({olabObject.id})
            </b>
          </>
        );
      }

      let currentChoices = this.createArrayFromValue(olabObject.value);
      var responses = this.buildQuestionResponses(
        olabObject,
        this.props.props.id,
        currentChoices
      );

      let row = olabObject.layoutType === 1 ? true : false;
      var disabled = olabObject.disabled == 0 ? false : true;

      return (
        <div
          className={`${styles["qumultichoice"]} ${siteStyles[id]}`}
          id={olabObject.htmlIdBase}
          olabid={olabObject.id}
        >
          <FormControl component="fieldset" disabled={disabled}>
            <FormLabel id={`${olabObject.htmlIdBase}::stem`} component="legend">
              <JsxParser jsx={olabObject.stem} />
            </FormLabel>
            <FormGroup id={`${olabObject.htmlIdBase}::choices`} row={row}>
              {responses}
            </FormGroup>
            {progressButtonHtml}
          </FormControl>
        </div>
      );
    } catch (error) {
      return this.errorJsx(id, error);
    }
  }
}

export default withStyles(styles)(OlabMultiPickQuestion);
