// @flow
import React from 'react';
import {
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  FormControl,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import log from 'loglevel';

import styles from '../../styles.module.css';
import siteStyles from '../../site.module.css';
import Spinner from '../../../../shared/assets/loading_med.gif';

class OlabSinglePickQuestion extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      id: props.props.id,
      name: props.props.name,
      question: props.props.question,
      dynamicObjects: props.props.dynamicObjects,
      showProgressSpinner: false,
      disabled: false
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

    this.setState(state => {

      if (typeof question.responseId == 'undefined')
        question.previousResponseId = null;
      else
        question.previousResponseId = question.responseId;
        
      question.responseId = response.id;      
      question.value = question.responseId;

      return ({ question });
    },
      () => this.transmitResponse()
    );

    // if (typeof onSubmitResponse !== 'undefined') {
    //   this.transmitResponse(value);
    // }

  }

  transmitResponse() {

    const { onSubmitResponse, authActions, map, node } = this.props.props;

    let responseState = {
      ...this.state,
      authActions,
      map,
      node,
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

      return (
        <div className={`${styles['qusinglechoice']} ${siteStyles[id]}`} id={`${id}`}>
          <FormControl component="fieldset">
            <FormLabel component="legend">{question.stem}</FormLabel>
            <RadioGroup
              style={{ float: 'left' }}
              name={`${id}-radio`}
              onChange={(event) => this.setValue(event)}
              row={row}
              value={question.value}
            >
              {question.responses.map((response) => (
                <FormControlLabel
                  id={`qr-${response.id}`}
                  value={response.id}
                  control={<Radio />}
                  label={response.response}
                  disabled={disabled}
                />
              ))}
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
