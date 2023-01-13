// @flow
import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import { getQuestion } from '../WikiTags';
import {
  postQuestionValue
} from '../../../services/api'
import styles from '../styles.module.css';
import OlabMultilineTextQuestion from './MultilineText/MultilineText';
import OlabSinglelineTextQuestion from './SingleLineText/SingleLineText';
import OlabSinglePickQuestion from './SingleChoice/SingleChoice';
import OlabMultiPickQuestion from './MultiChoice/MultiChoice';
import OlabSliderQuestion from './Slider/Slider';
import OlabDropDownQuestion from './DropDown/DropDown';
import OlabDragAndDropQuestion from './DragAndDrop/DragAndDrop';
import OlabAttendeeTag from './TurkTalk/Turkee/Turkee';
import OlabModeratorTag from './TurkTalk/Turker/Turker';

const persistantStorage = require('../../../utils/StateStorage').PersistantStateStorage;

class OlabQuestionTag extends React.Component {

  constructor(props) {

    super(props);

    let question = getQuestion(this.props.name, this.props);

    if ((question.questionType !== 3) && (question.questionType !== 2)) {
      if (question.value === null) {
        question.value = 0;
      }
    }
    else {
      if (question.value === null) {
        question.value = '';
      }
    }

    if (question.width === 0) {
      question.width = 300;
    }

    this.state = {
      question,
      ...props.props
    };

    // Binding this keyword  
    this.onSubmitResponse = this.onSubmitResponse.bind(this)
  }

  static getQuestionId(question) {
    if (question.name == null) {
      return "QU" + question.id;
    }
    return ("QU-" + question.name.replace(' ', '')).toLowerCase();
  }

  sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onSubmitResponse = async (newState) => {

    var { data } = await postQuestionValue(newState);
    
    // bubble up the dynamic object to player since the
    // objects may be shared to other components
    if ((data != null) && (this.props.props.onUpdateDynamicObjects)) {
      this.props.props.onUpdateDynamicObjects(data);
    }
  }

  render() {

    if (this.state.question != null) {

      if (persistantStorage.get('dbg-disableWikiRendering')) {
        return (
          <>
            <b>{this.state.question.wiki} type {this.state.question.questionType} "{this.state.question.stem}"</b>
          </>
        );
      }

      const customId = OlabQuestionTag.getQuestionId(this.state.question);

      let props = {
        authActions: this.props.props.authActions,
        id: customId,
        name: this.props.name,
        onSubmitResponse: this.onSubmitResponse,
        question: this.state.question,
        map: this.state.map,
        node: this.state.node,
        dynamicObjects: this.state.dynamicObjects,
        contextId: this.props.props.contextId
      };

      let questionType = props.question.questionType;

      switch (questionType) {
        case 1:
          return (
            <OlabSinglelineTextQuestion props={props} />
          );
        case 2:
          return (
            <OlabMultilineTextQuestion props={props} />
          );
        case 3:
          return (
            <OlabMultiPickQuestion props={props} />
          );
        case 4:
          return (
            <OlabSinglePickQuestion props={props} />
          );
        case 5:
          return (
            <OlabSliderQuestion props={props} />
          );
        case 6:
          return (
            <OlabDragAndDropQuestion props={props} />
          );
        case 15:
          return (
            <OlabModeratorTag props={props} />
          );
        case 12:
          return (
            <OlabDropDownQuestion props={props} />
          );
        case 11:
          return (
            <OlabAttendeeTag props={props} />
          );
        default:
          return (
            <div><b>Error:</b> Implemented question type '{questionType}'</div>
          );
      }
    }

    return '';

  }

}

export default withStyles(styles)(OlabQuestionTag);