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

class OlabMultiPickQuestion extends React.Component {
  constructor(props) {
    super(props);

    log.debug(`${this.constructor["name"]} ctor`);

    let currentChoices = this.createArrayFromValue(
      this.props.props.question.value
    );
    var responses = this.buildQuestionResponses(
      this.props.props.question,
      this.props.props.id,
      currentChoices
    );

    this.state = {
      ...props.props,
      hasInitialAnswer: false,
      responses,
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
    const question = this.state.question;

    if (choiceArray == null) {
      choiceArray = [];
    }

    let value = null;
    let valueOverride;
    const checked = event.target.checked;
    const alreadyContains = choiceArray.includes(choiceId);

    if (checked && choiceArray.length === 0) {
      value = choiceId;
      valueOverride = question.responses.find(
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
        question.responses
          .filter((res) => choiceArray.map((n) => +n).includes(res.id))
          .map((res) => res.response)
      );
    }

    log.debug(
      `${this.constructor["name"]} set question '${question.id}' value = '${value}'`
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
        question.previousValue = question.value;
        question.value = value;
        question.valueOverride = valueOverride;
        return { question };
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

  buildQuestionResponses(question, id, currentChoices) {
    let responses = [];
    let selectedIndexStrings = [];

    if (question.value) {
      selectedIndexStrings = question.value.split(",");
    }

    let selectedIndexes = selectedIndexStrings.map((item) => Number(item));

    for (const response of question.responses) {
      let responseHtml = this.buildQuestionResponse(
        question,
        id,
        response,
        currentChoices,
        selectedIndexes
      );
      responses.push(responseHtml);
    }

    return responses;
  }

  buildQuestionResponse(
    question,
    id,
    response,
    currentChoices,
    responseIndexes
  ) {
    let correctnessIndicator = <>{response.response}</>;
    let feedback = null;

    if (responseIndexes.includes(response.id)) {
      feedback = response.feedback;
    }

    if (question.showAnswer) {
      // check if response is selected, meaning we display
      // is_correct and feedback.
      if (currentChoices.includes(`${response.id}`)) {
        // test for 'correct' answer
        if (response.isCorrect == 1 && question.showAnswerIndicators) {
          correctnessIndicator = (
            <>
              {response.response}
              <CheckIcon style={{ color: "green" }} />
              {feedback}
            </>
          );
        }

        // test for 'incorrect' answer
        if (response.isCorrect == -1 && question.showAnswerIndicators) {
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
        id={`${id}::QR:${response.id}`}
        name={response.name}
        onChange={(event) =>
          this.setValue(event, currentChoices, response.id.toString())
        }
        key={response.id}
        control={
          <Checkbox
            id={`${id}::QR:${response.name}::value`}
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
    const { id, name, question, responses } = this.state;

    log.debug(`${this.constructor["name"]} render '${name}'`);

    try {
      let row = question.layoutType === 1 ? true : false;
      var disabled = question.disabled == 0 ? false : true;

      return (
        <div
          className={`${styles["qumultichoice"]} ${siteStyles[id]}`}
          id={`${id}`}
        >
          <FormControl component="fieldset" disabled={disabled}>
            <FormLabel id={`${id}::stem`} component="legend">
              <JsxParser jsx={question.stem} />
            </FormLabel>
            <FormGroup id={`${id}::choices`} row={row}>
              {responses}
            </FormGroup>
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

export default withStyles(styles)(OlabMultiPickQuestion);
