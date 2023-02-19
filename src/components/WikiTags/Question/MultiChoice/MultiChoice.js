// @flow
import React from 'react';
import {
  FormControlLabel,
  FormLabel,
  FormGroup,
  Checkbox,
  FormControl,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Log, LogInfo, LogError } from '../../../../utils/Logger';
import log from 'loglevel';

import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';

import styles from '../../styles.module.css';
import siteStyles from '../../site.module.css';

class OlabMultiPickQuestion extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      ...props.props,
      hasInitialAnswer: false
    };

    // Binding this keyword  
    this.setInProgress = this.setInProgress.bind(this);
    this.setValue = this.setValue.bind(this);
    this.transmitResponse = this.transmitResponse.bind(this);
  }

  createArrayFromValue(source) {

    if (!source.includes(',') && (!source.length)) {
      return [];
    }

    if (!source.includes(',') && (source.length)) {
      return [source];
    }

    return source.split(',');
  }

  createValueFromArray(source) {

    if (source.length === 1) {
      return source[0];
    }

    else {
      return source.toString();
    }
  }

  setValue = (event, choiceArray, choiceId) => {

    const question = this.state.question;

    if (choiceArray == null) {
      choiceArray = [];
    }

    let value = null;
    const checked = event.target.checked;
    const alreadyContains = choiceArray.includes(choiceId);

    if (checked && (choiceArray.length === 0)) {
      value = choiceId;
    }

    else {

      if (!checked && alreadyContains) {

        const index = choiceArray.indexOf(choiceId);
        if (index > -1) {
          choiceArray.splice(index, 1);
        }

      }

      else if (checked && !alreadyContains) {
        choiceArray.push(choiceId);
      }

      value = this.createValueFromArray(choiceArray);
    }

    log.debug(`OlabMultiPickQuestion set question '${question.id}' value = '${value}'`);

    // if single try question, disabled it
    if (question.numTries > 0) {
      question.disabled = true;
    }

    // first attempt to answer, so show answer
    // indicators, if called on
    question.showAnswerIndicators = true;

    this.setState(state => {
      question.previousValue = question.value;
      question.value = value;
      return ({ question });
    },
      () => this.transmitResponse()
    );

  }

  transmitResponse() {

    const {
      onSubmitResponse,
      authActions,
      map,
      node,
      contextId } = this.props.props;

    let responseState = {
      ...this.state,
      authActions,
      map,
      node,
      contextId,
      setInProgress: this.setInProgress,
      setIsDisabled: this.setIsDisabled
    };

    if (typeof onSubmitResponse !== 'undefined') {
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

  buildQuestionResponses(question, currentChoices) {

    let responses = [];
    let selectedIndexStrings = [];

    if (this.state.question.value) {
      selectedIndexStrings = this.state.question.value.split(',');
    }

    let selectedIndexes = selectedIndexStrings.map(item => Number(item));

    for (const response of question.responses) {
      let responseHtml = this.buildQuestionResponse(
        question,
        response,
        currentChoices,
        selectedIndexes);
      responses.push(responseHtml);
    }

    return responses;
  }

  buildQuestionResponse(question, response, currentChoices, responseIndexes) {

    let correctnessIndicator = (<>{response.response}</>);
    let feedback = null;

    if (responseIndexes.includes(response.id)) {
      feedback = response.feedback;
    }

    if (question.showAnswer) {

      // check if response is selected, meaning we display
      // is_correct and feedback.
      if (currentChoices.includes(`${response.id}`)) {

        // test for 'correct' answer
        if ((response.isCorrect == 1) && (question.showAnswerIndicators)) {
          correctnessIndicator = (<>{response.response}<CheckIcon style={{ color: 'green' }} />{feedback}</>);
        }

        // test for 'incorrect' answer
        if ((response.isCorrect == 0) && (question.showAnswerIndicators)) {
          correctnessIndicator = (<>{response.response}<CloseIcon style={{ color: 'red' }} />{feedback}</>);
        }
      }

    }

    let responseHtml = (
      <FormControlLabel
        onChange={(event) => this.setValue(event, currentChoices, response.id.toString())}
        key={response.id}
        control={<Checkbox name={`qr-${response.id}`} />}
        label={correctnessIndicator}
        checked={currentChoices.includes(response.id.toString())}
      />
    );

    return responseHtml;

  }

  render() {

    const {
      id,
      name,
      question
    } = this.state;

    log.debug(`OlabMultiPickQuestion render '${name}'`);

    try {
      let row = question.layoutType === 1 ? true : false;
      let currentChoices = this.createArrayFromValue(question.value);

      var responses = this.buildQuestionResponses(question, currentChoices);
      var disabled = question.disabled == 0 ? false : true;

      return (
        <div className={`${styles['qumultichoice']} ${siteStyles[id]}`} id={`${id}`}>
          <FormControl component="fieldset" disabled={disabled}>
            <FormLabel component="legend">{question.stem}</FormLabel>
            <FormGroup row={row} >
              {responses}
            </FormGroup>
          </FormControl>

        </div>
      );
    } catch (error) {
      return (
        <>
          <b>[[QU:{id}]] "{error.message}"</b>
        </>
      );
    }

  }

}

export default withStyles(styles)(OlabMultiPickQuestion);
