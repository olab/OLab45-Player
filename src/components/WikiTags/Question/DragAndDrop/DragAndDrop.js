// @flow
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { withStyles } from '@material-ui/core/styles';
import { Log, LogInfo, LogError } from '../../../../utils/Logger';
import DragDropContainer from './DragDropContainer';

import styles from '../../styles.module.css';
import siteStyles from '../../site.module.css';

class OlabDragAndDropQuestion extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      ...props.props
    };

    // Binding this keyword  
    this.setInProgress = this.setInProgress.bind(this)

  }

  setValue = (responses) => {

    const question = this.state.question;    
    Log(`responses`);

    let values = [];

    for (const iterator of responses) {
      Log(` ${iterator.response}(${iterator.id})`);
      values.push(iterator.id);
    }    

    if ( typeof question.previousValue == 'undefined' ) {
      question.previousValue = null;
    }
    else {
      question.previousValue = question.value;
    }

    question.value = values.join(',');

    Log(`OlabSinglePickQuestion set question '${question.id}' value = '${question.value}'.`);

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
    Log(`set progress spinner: ${inProgress}`);
  }

  setIsDisabled(disabled) {

    this.setState({ disabled: disabled });
    Log(`set disabled: ${disabled}`);
  }

  render() {

    const {
      id,
      name,
      question,
      // disabled
    } = this.state;

    Log(`OlabDragAndDropQuestion render '${name}'`);

    try {

      let width = 300;
      if (question.width) {
        width = question.width;
      }

      return (
        <div className={`${styles['qudraganddrop']} ${siteStyles[id]}`} id={`${id}`}>
          <DndProvider backend={HTML5Backend}>
            <DragDropContainer 
              width={width} 
              onChange={this.setValue}
              responses={question.responses} />
          </DndProvider>
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

export default withStyles(styles)(OlabDragAndDropQuestion);
