// @flow
import React from 'react';
import {
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  FormControl,
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';

import { withStyles } from '@material-ui/core/styles';
import log from 'loglevel';

import styles from '../../styles.module.css';
import siteStyles from '../../site.module.css';
import Spinner from '../../../../shared/assets/loading_med.gif';

class OlabSinglePickQuestion extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      ...props.props
    };

    // Binding this keyword  
    this.setInProgress = this.setInProgress.bind(this);
    this.setValue = this.setValue.bind(this);
    this.transmitResponse = this.transmitResponse.bind(this);
  }

  setValue = (event) => {

    const value = Number(event.target.value);
    const question = this.state.question;

    log.debug(`OlabSinglePickQuestion set question '${question.id}' value = '${value}'.`);

    let response = null;

    // if value corresponds to a response id, match it to a response
    for (let index = 0; index < this.state.question.responses.length; index++) {
      response = this.state.question.responses[index];
      if (response.id === value) {
        break;
      }
    }

    if (typeof question.responseId == 'undefined')
      question.previousResponseId = null;
    else
      question.previousResponseId = question.responseId;

    question.responseId = response.id;
    question.value = question.responseId;

    log.debug(`OlabSinglePickQuestion set question '${question.id}' value = '${value}'`);

    // if single try question, disabled it
    if ( question.numTries > 0 ) {
      question.disabled = true;
    }
    
    // first attempt to answer, so show answer
    // indicators, if called on
    question.showAnswerIndicators = true;

    this.setState({ question });
    this.transmitResponse();
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

  buildQuestionResponses(question) {

    let responses = [];
    let key = 0;
    for (const response of question.responses) {
      var item = (
        <div key={key++}>
          {this.buildQuestionResponse(question, response)}
        </div>
      );
      responses.push(item);
    }

    return responses;
  }

  buildQuestionResponse(question, response) {

    let choice = (
      <FormControlLabel
        id={`qr-${response.id}`}
        value={response.id}
        control={<Radio />}
        label={response.response}
      />
    );

    let correctnessIndicator = (<></>);

    if (question.showAnswer) {

      // test for 'correct' answer
      if ((response.isCorrect > 0) && question.showAnswerIndicators) {
        correctnessIndicator = (<CheckIcon style={{ color: 'green' }} />);
      }

      // test for 'incorrect' answer
      if ((response.isCorrect == 0) && question.showAnswerIndicators) {
        correctnessIndicator = (<CloseIcon style={{ color: 'red' }} />);
      }
    }

    return (
      <>
        {choice}
        {correctnessIndicator}
      </>
    );

  }

  render() {

    const {
      id,
      name,
      question,
    } = this.state;

    log.debug(`OlabSinglePickQuestion render '${name}'`);

    try {

      let row = question.layoutType === 1 ? true : false;

      let progressButtonHtml = '';
      if (this.state.showProgressSpinner) {
        progressButtonHtml = <img style={{ float: 'left', width: 40, height: 40 }} src={Spinner} alt="" />;
      }

      var responses = this.buildQuestionResponses(question);
      var disabled = question.disabled == 0 ? false : true;

      return (
        <div className={`${styles['qusinglechoice']} ${siteStyles[id]}`} id={`${id}`}>
          <FormControl component="fieldset" disabled={disabled}>
            <FormLabel component="legend">{question.stem}</FormLabel>
            <RadioGroup
              style={{ float: 'left' }}
              name={`${id}-radio`}
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
          <b>[[QU:{id}]] "{error.message}"</b>
        </>
      );
    }
  }

}

export default withStyles(styles)(OlabSinglePickQuestion);
