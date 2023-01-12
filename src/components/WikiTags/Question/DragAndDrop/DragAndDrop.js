// @flow
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { withStyles } from '@material-ui/core/styles';
import log from 'loglevel';
import DragDropContainer from './DragDropItems';

import styles from '../../styles.module.css';
import siteStyles from '../../site.module.css';

class OlabDragAndDropQuestion extends React.Component {

  constructor(props) {

    super(props);
    this.state = {
      // id: props.props.id,
      // name: props.props.name,
      // authActions: props.props.authActions,
      // question: props.props.question,
      // dynamicObjects: props.props.dynamicObjects,
      // onSubmitResponse: props.props.onSubmitResponse,
      // map: props.props.map,
      // node: props.props.node,
      showProgressSpinner: false,
      disabled: false,
      ...props.props
    };

    // Binding this keyword  
    this.setInProgress = this.setInProgress.bind(this)

  }

  setValue = (event) => {

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
      // disabled
    } = this.state;

    log.debug(`OlabDragAndDropQuestion render '${name}'`);

    try {

      let width = 300;
      if (question.width) {
        width = question.width;
      }

      return (
        <div className={`${styles['qudraganddrop']} ${siteStyles[id]}`} id={`${id}`}>
          <DndProvider backend={HTML5Backend}>
            <DragDropContainer width={width} responses={question.responses} />
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
