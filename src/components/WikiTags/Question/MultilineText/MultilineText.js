// @flow
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import log from 'loglevel';

import styles from '../../styles.module.css';
import siteStyles from '../../site.module.css';
import Spinner from '../../../../shared/assets/loading_med.gif';

class OlabMultilineTextQuestion extends React.Component {

  constructor(props) {

    super(props);
    this.state = {
      id: props.props.id,
      name: props.props.name,
      question: props.props.question,
      authActions: props.props.authActions,
      dynamicObjects: props.props.dynamicObjects,
      onSubmitResponse: props.props.onSubmitResponse,
      showProgressSpinner: false,
      disabled: false,
      map: props.props.map,
      node: props.props.node
    };

    // Binding this keyword  
    this.setInProgress = this.setInProgress.bind(this)
  }

  setInProgress(inProgress) {

    this.setState({ showProgressSpinner: inProgress });
    log.debug(`set progress spinner: ${inProgress}`);
  }

  setValue = (event) => {

    const question = this.state.question;
    const value = question.value;
    let disabled = this.state.disabled;

    // test if only one respond allowed.  Disable control
    // if this is the case
    if ((question.numTries === -1) || (question.numTries === 1)) {
      this.setState(state => {
        disabled = true;
        log.debug(`OlabMultilineTextQuestion disabled question '${question.id}' value = '${value}'.`);
        return ({ disabled });
      });
    }

    this.transmitResponse();
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

  handleChange = (event) => {

    const value = event.target.value;
    const question = this.state.question;

    // set the question value in trackable state
    this.setState(state => {
      question.value = value;
      return ({ question });
    });
  }

  render() {

    const {
      id,
      name,
      question,
      disabled
    } = this.state;

    log.debug(`OlabMultilineTextQuestion render '${name}'`);

    try {

      let progressButtonHtml = '';
      if (this.state.showProgressSpinner) {
        progressButtonHtml = <img style={{ float: 'left', width: 40, height: 40 }} src={Spinner} alt="" />;
      }

      let valueClasses = [];
      valueClasses.push(styles['qumultiline-value']);
      if (question.numTries === -1) {
        valueClasses.push(styles['qumultiline-required']);
      }

      return (
        <div className={`${styles['qumultiline']} ${siteStyles[id]}`} id={`${id}`}>
          <div id={`${id}-label`} className={`${styles['qumultiline-label']}`}>{question.stem}</div>
          <div className={`${styles['qumultiline-value-container']}`}>
            <textarea
              rows={`${question.height}`}
              cols={`${question.width}`}
              placeholder={`${question.prompt}`}
              className={`${valueClasses.join(" ")}`}
              id={`${id}-value`}
              value={question.value}
              disabled={disabled}
              onChange={this.handleChange}>                
            </textarea>
          </div>
          <div>
            <button
              id={`${id}-submit`}
              disabled={disabled}
              onClick={(event) => this.setValue(event)}>
              Submit
            </button>
            {progressButtonHtml}
          </div>
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

export default withStyles(styles)(OlabMultilineTextQuestion);
