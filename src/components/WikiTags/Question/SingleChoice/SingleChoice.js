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

    // let questionState = props.props.dynamicObjects.question?.[`props.props.question.id`];
    // if (!questionState) {
    //   questionState = { 
    //     showAnswerIndicators: false,
    //     disabled: false
    //   };
    // }

    this.state = {
      // id: props.props.id,
      // name: props.props.name,
      // question: props.props.question,
      // dynamicObjects: props.props.dynamicObjects,
      // ...questionState,
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

    // if single try question, disabled it
    if ( question.numTries > 0 ) {
      question.disabled = true;
    }

    // first attempt to answer, so show answer
    // indicators
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

    for (const response of question.responses) {
      responses.push(this.buildQuestionResponse(question, response));
    }

    return responses;
  }

  buildQuestionResponse(question, response) {

    const { showAnswerIndicators, disabled } = this.state;

    let radioChoice = (
      <FormControlLabel
        id={`qr-${response.id}`}
        value={response.id}
        control={<Radio />}
        label={response.response}
        disabled={disabled}
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
        {radioChoice}
        {correctnessIndicator}
      </>
    );

  }

  render() {

    const {
      id,
      name,
      question,
      disabled
    } = this.state;

    log.debug(`OlabSinglePickQuestion render '${name}'`);

    try {

      let row = question.layoutType === 1 ? true : false;

      let progressButtonHtml = '';
      if (this.state.showProgressSpinner) {
        progressButtonHtml = <img style={{ float: 'left', width: 40, height: 40 }} src={Spinner} alt="" />;
      }

      var responses = this.buildQuestionResponses(question);

      return (
        <div className={`${styles['qusinglechoice']} ${siteStyles[id]}`} id={`${id}`}>
          <FormControl component="fieldset" disabled={question.disabled}>
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
