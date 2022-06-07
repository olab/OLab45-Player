// @flow
import React from 'react';
import {
  Box,
  Typography,
  Slider,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import log from 'loglevel';

import styles from '../../styles.module.css';
import siteStyles from '../../site.module.css';

class OlabSliderQuestion extends React.Component {

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

    // post initial value to server if initializine
    // question value
    if (typeof this.state.question.previousValue == "undefined") {

      // eslint-disable-next-line      
      const settings = JSON.parse(this.state.question.settings);
      this.state.question.value = Number(settings.defaultValue);

    }

    // Binding this keyword  
    this.setInProgress = this.setInProgress.bind(this);
    this.setValue = this.setValue.bind(this);
    this.transmitResponse = this.transmitResponse.bind(this);
  }

  setValue = (event, value) => {

    const question = this.state.question;
    log.debug(`OlabSliderQuestion set question '${question.id}' value = '${value}'`);

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

  render() {

    const {
      id,
      question,
      // disabled
    } = this.state;

    log.debug(`OlabSliderQuestion render '${this.props.name}'`);

    try {

      // eslint-disable-next-line
      const settings = JSON.parse(question.settings);

      return (
        <div className={`${styles['quslider']} ${siteStyles[id]}`} id={`${id}`}>
          <Box width={question.width}>
            <Typography id={`${id}-stem`} component="div" gutterBottom>
              {question.stem}
            </Typography>
            <input readOnly className={`${styles['quslider-value']}`} id={`${id}-value`} value={question.value}></input>
            <Slider
              defaultValue={question.value}
              onChangeCommitted={(event, value) => this.setValue(event, value)}
              step={Number(settings.stepValue)}
              marks
              name={`${id}-slider`}
              min={Number(settings.minValue)}
              max={Number(settings.maxValue)}
              track={true}
              valueLabelDisplay="auto"
            />
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

export default withStyles(styles)(OlabSliderQuestion);
