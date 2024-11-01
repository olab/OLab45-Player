// @flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";

import { getQuestion } from "../WikiUtils";
import { postQuestionValue } from "../../../services/api";
import styles from "../styles.module.css";
import OlabMultilineTextQuestion from "./MultilineText/MultilineText";
import OlabSinglelineTextQuestion from "./SingleLineText/SingleLineText";
import OlabSinglePickQuestion from "./SinglePick/SinglePick";
import OlabMultiPickQuestion from "./MultiplePick/MultiplePick";
import OlabSliderQuestion from "./Slider/Slider";
import OlabDropDownQuestion from "./DropDown/DropDown";
import OlabDragAndDropQuestion from "./DragAndDrop/DragAndDrop";
import OlabAttendeeTag from "./TurkTalk/Turkee/Turkee";
import OlabModeratorTag from "./TurkTalk/Turker/Turker";
const playerState = require("../../../utils/PlayerState").PlayerState;
import log from "loglevel";

class OlabQuestionTag extends React.Component {
  constructor(props) {
    super(props);

    log.debug(`${this.constructor["name"]} ctor`);

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

    const customId = OlabQuestionTag.getQuestionId(question);

    this.state = {
      debug,
      question,
      ...props.props,
      customId,
    };

    // Binding this keyword
    this.onSubmitResponse = this.onSubmitResponse.bind(this);
  }

  componentWillUnmount() {
    log.debug(
      `${this.constructor["name"]} '${this.state.question.name}' componentWillUnmount`
    );
  }

  static getQuestionId(question) {
    if (question.name != null) {
      return "QU:" + question.name;
    }
    return "QU:" + question.id;
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
    const { debug, question, customId } = this.state;
    const { name } = this.props;

    const questionDivStyle = {
      paddingTop: "10px",
      paddingBottom: "10px",
    };

    try {
      if (question != null) {
        log.debug(
          `rendering question '${question.name}' typeid: ${question.questionType}`
        );

        if (debug.disableWikiRendering) {
          return (
            <>
              <b>
                {question.wiki} type {question.questionType} "{question.stem}"
              </b>
            </>
          );
        }

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
          onNavigateToNode: this.props.props.onNavigateToNode,
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
            throw new Error(`Unimplemented question type '${questionType}'`);
        }
      }

      throw new Error(`'${this.props.name}' not found`);
    } catch (error) {
      return (
        <>
          <b>
            [[QU:{name}]] "{error.message}"
          </b>
        </>
      );
    }

    return "";
  }
}

export default withStyles(styles)(OlabQuestionTag);
