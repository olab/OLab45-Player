// @flow
import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import log from 'loglevel';

import styles from '../../styles.module.css';
import siteStyles from '../../site.module.css';
const persistantStorage = require('../../../../utils/StateStorage').PersistantStateStorage;

class OlabDropDownQuestion extends React.Component {

  constructor(props) {

    super(props);
    this.state = {
      // id: props.props.id,
      // name: props.props.name,
      // authActions: props.props.authActions,
      // question: props.props.question,
      // onSubmitResponse: props.props.onSubmitResponse,
      // dynamicObjects: props.props.dynamicObjects,
      // map: props.props.map,
      // node: props.props.node ,
      showProgressSpinner: false,
      disabled: false,
      ...props.props
    };

    // Binding this keyword  
    this.setInProgress = this.setInProgress.bind(this)    
  }

  setValue = (event, setInProgress, setIsDisabled) => {

    const value = Number(event.target.value);
    const question = this.state.question;
    let sessionId = persistantStorage.get('sessionId');

    // test if only one respond allowed.  Disable control
    // if this is the case
    // if ((question.numTries === -1) || (question.numTries === 1)) {
    //   this.setState(state => {
    //     disabled = true;
    //     log.debug(`OlabSinglePickQuestion disabled question '${question.id}' value = '${value}'.`);
    //     return ({ disabled });
    //   });
    // }

    this.setState(state => {
      question.value = value;
      log.debug(`OlabDropDownQuestion set question '${question.id}' value = '${value}'.`);
      return ({ question });
    });

    let response = null;

    for (let index = 0; index < this.state.question.responses.length; index++) {
      response = this.state.question.responses[index];
      if (response.id === value) {
        break;
      }
    }

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

  render() {

    const {
      id,
      name,
      question,
      disabled
    } = this.state;

    log.debug(`OlabDropDownQuestion render '${name}'`);

    try {
      return (
        <div className={`${styles['quddropdown']} ${siteStyles[id]}`} id={`${id}`}>
          <Box width={question.width}>
            <FormControl fullWidth>
              <InputLabel id={`${id}-label`}>{question.stem}</InputLabel>
              <Select
                id={`${id}-select`}
                value={question.value}
                onChange={(event) => this.setValue(event, this.setInProgress, this.setIsDisabled)}
                disabled={disabled}
                autowidth
              >
                <MenuItem value={0}>-- Select --</MenuItem>
                {question.responses.map((response) => (
                  <MenuItem value={Number(response.id)}>{response.response}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
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

export default withStyles(styles)(OlabDropDownQuestion);
