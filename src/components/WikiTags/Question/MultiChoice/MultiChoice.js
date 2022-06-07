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
import log from 'loglevel';

import styles from '../../styles.module.css';
import siteStyles from '../../site.module.css';

class OlabMultiPickQuestion extends React.Component {

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

    this.setState(state => {
      question.previousValue = question.value;
      question.value = value;  
      return ({ question });
    },
      () => this.transmitResponse()
    );

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

    log.debug(`OlabMultiPickQuestion render '${name}'`);

    try {
      let row = question.layoutType === 1 ? true : false;
      let currentChoices = this.createArrayFromValue(question.value);

      return (
        <div className={`${styles['qumultichoice']} ${siteStyles[id]}`} id={`${id}`}>
          <FormControl component="fieldset">
            <FormLabel component="legend">{question.stem}</FormLabel>
            <FormGroup
              row={row}
            >
              {question.responses.map((response) => (
                <FormControlLabel
                  onChange={(event) => this.setValue(event, currentChoices, response.id.toString())}
                  key={response.id.toString()}
                  control={<Checkbox name={`qr-${response.id}`} />}
                  label={response.response}
                  checked={currentChoices.includes(response.id.toString())}
                  disabled={disabled}
                />
              ))}

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
