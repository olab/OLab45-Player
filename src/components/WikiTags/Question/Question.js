// @flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";

import { getQuestion } from "../WikiTags";
import { postQuestionValue } from "../../../services/api";
import styles from "../styles.module.css";
import OlabMultilineTextQuestion from "./MultilineText/MultilineText";
import OlabSinglelineTextQuestion from "./SingleLineText/SingleLineText";
import OlabSinglePickQuestion from "./SingleChoice/SingleChoice";
import OlabMultiPickQuestion from "./MultiChoice/MultiChoice";
import OlabSliderQuestion from "./Slider/Slider";
import OlabDropDownQuestion from "./DropDown/DropDown";
import OlabDragAndDropQuestion from "./DragAndDrop/DragAndDrop";
import OlabAttendeeTag from "./TurkTalk/Turkee/Turkee";
import OlabModeratorTag from "./TurkTalk/Turker/Turker";
import { config } from "../../../config";

const playerState = require("../../../utils/PlayerState").PlayerState;
import { Log, LogInfo, LogError } from "../../../utils/Logger";
import log from "loglevel";

class OlabQuestionTag extends React.Component {
  constructor(props) {
    super(props);

    let question = getQuestion(this.props.name, this.props);
    const debug = playerState.GetDebug();

    if (question.questionType !== 3 && question.questionType !== 2) {
      if (question.value === null) {
        question.value = 0;
      }
    } else {
      if (question.value === null) {
        question.value = "";
      }
    }

    if (question.width === 0) {
      question.width = 300;
    }

    this.state = {
      question,
      ...props.props,
      debug,
    };

    // Binding this keyword
    this.onSubmitResponse = this.onSubmitResponse.bind(this);
  }

  static getQuestionId(question) {
    return "QU-" + question.id;
  }

  sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  onSubmitResponse = async (newState) => {
    // send question response to server and get the
    // new dynamic objects state
    var { data } = await postQuestionValue(newState);

    // bubble up the dynamic object to player since the
    // dynamic objects may be shared to other components
    if (data != null && this.props.props.onUpdateDynamicObjects) {
      this.props.props.onUpdateDynamicObjects(data);
    }
  };

  render() {
    const { debug } = this.state;
    const questionDivStyle = {
      paddingTop: "10px",
      paddingBottom: "10px",
    };

    log.debug(
      `rendering question '${this.state.question.name}' typeid: ${this.state.question.questionType}`
    );

    if (this.state.question != null) {
      if (debug.disableWikiRendering) {
        return (
          <>
            <b>
              {this.state.question.wiki} type {this.state.question.questionType}{" "}
              "{this.state.question.stem}"
            </b>
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
        contextId: this.props.props.contextId,
      };

      let questionType = props.question.questionType;

      switch (questionType) {
        case 1:
          return (
            <div style={questionDivStyle}>
              <OlabSinglelineTextQuestion props={props} />
            </div>
          );
        case 2:
          return (
            <div style={questionDivStyle}>
              <OlabMultilineTextQuestion props={props} />
            </div>
          );
        case 3:
          return (
            <div style={questionDivStyle}>
              <OlabMultiPickQuestion props={props} />
            </div>
          );
        case 4:
          return (
            <div style={questionDivStyle}>
              <OlabSinglePickQuestion props={props} />
            </div>
          );
        case 5:
          return (
            <div style={questionDivStyle}>
              <OlabSliderQuestion props={props} />
            </div>
          );
        case 6:
          return (
            <div style={questionDivStyle}>
              <OlabDragAndDropQuestion props={props} />
            </div>
          );
        case 11:
          return (
            <div style={questionDivStyle}>
              <OlabModeratorTag props={props} />
            </div>
          );
        case 12:
          return (
            <div style={questionDivStyle}>
              <OlabDropDownQuestion props={props} />
            </div>
          );
        case 15:
          return (
            <div style={questionDivStyle}>
              <OlabAttendeeTag props={props} />
            </div>
          );
        default:
          return (
            <div>
              <b>Error:</b> Unimplemented question type '{questionType}'
            </div>
          );
      }
    }

    return "";
  }
}

export default withStyles(styles)(OlabQuestionTag);
