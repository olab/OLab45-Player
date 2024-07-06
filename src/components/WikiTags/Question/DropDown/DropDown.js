// @flow
import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";

import CloseIcon from "@material-ui/icons/Close";
import CheckIcon from "@material-ui/icons/Check";
import Spinner from "../../../../shared/assets/loading_med.gif";
import JsxParser from "react-jsx-parser";

import { withStyles } from "@material-ui/core/styles";
import log from "loglevel";

import styles from "../../styles.module.css";
import siteStyles from "../../site.module.css";

import { getQuestion } from "../../WikiTags";
import { postQuestionValue } from "../../../../services/api";
const playerState = require("../../../../utils/PlayerState").PlayerState;

class OlabDropDownQuestion extends React.Component {
  constructor(props) {
    super(props);

    log.debug(`${this.constructor["name"]} ctor`);

    let question = getQuestion(this.props.name, this.props);
    const debug = playerState.GetDebug();

    this.state = {
      debug,
      question,
      ...props.props,
    };

    // Binding this keyword
    this.setInProgress = this.setInProgress.bind(this);
    this.setValue = this.setValue.bind(this);
    this.transmitResponse = this.transmitResponse.bind(this);
  }

  componentWillUnmount() {
    log.debug(
      `${this.constructor["name"]} '${this.state.question.name}' componentWillUnmount`
    );
  }

  setInProgress(inProgress) {
    this.setState({ showProgressSpinner: inProgress });
    log.debug(`set progress spinner: ${inProgress}`);
  }

  setIsDisabled(disabled) {
    this.setState({ disabled: disabled });
    log.debug(`set disabled: ${disabled}`);
  }

  setValue = (event, setInProgress, setIsDisabled) => {
    const value = Number(event.target.value);
    const question = this.state.question;

    this.setState((state) => {
      question.value = value;
      log.debug(
        `${this.constructor["name"]}  set question '${question.id}' value = '${value}'.`
      );
      return { question };
    });

    let response = null;

    for (let index = 0; index < this.state.question.responses.length; index++) {
      response = this.state.question.responses[index];
      if (response.id === value) {
        break;
      }
    }

    if (typeof question.responseId == "undefined")
      question.previousResponseId = null;
    else question.previousResponseId = question.responseId;

    question.responseId = response.id;
    question.value = question.responseId;

    log.debug(
      `${this.constructor["name"]}  set question '${question.id}' value = '${value}'`
    );

    // if single try question, disabled it
    if (question.numTries > 0) {
      question.disabled = true;
    }

    // first attempt to answer, so show answer
    // indicators, if called on
    question.showAnswerIndicators = true;

    this.setState({ question });
    this.transmitResponse();
  };

  transmitResponse() {
    const { authActions, map, node, contextId } = this.props.props;

    let responseState = {
      ...this.state,
      authActions,
      map,
      node,
      contextId,
      setInProgress: this.setInProgress,
      setIsDisabled: this.setIsDisabled,
    };

    this.onSubmitResponse(responseState);
  }

  buildQuestionResponses(question, id) {
    let responses = [];
    let key = 0;
    for (const response of question.responses) {
      var item = (
        <MenuItem
          id={`${id}::QR:${response.id}`}
          key={key++}
          value={Number(response.id)}
        >
          {response.response}
        </MenuItem>
      );
      responses.push(item);
    }

    return responses;
  }

  render() {
    const { debug, question } = this.state;
    const { id, name } = this.props;

    log.debug(`${this.constructor["name"]} render`);

    try {
      let progressButtonHtml = "";
      if (this.state.showProgressSpinner) {
        progressButtonHtml = (
          <img
            style={{ float: "left", width: 40, height: 40 }}
            src={Spinner}
            alt=""
          />
        );
      }

      if (debug.disableWikiRendering) {
        return (
          <>
            <b>
              [[{id}]] ({question.id})
            </b>
          </>
        );
      }

      var responses = this.buildQuestionResponses(question, id);
      var disabled = question.disabled == 0 ? false : true;

      return (
        <div
          className={`${styles["quddropdown"]} ${siteStyles[id]}`}
          id={`${id}`}
        >
          <Box width={question.width}>
            <FormControl fullWidth disabled={disabled}>
              <div
                id={`${id}::stem`}
                className={`${styles["qumultiline-stem"]}`}
              >
                <JsxParser jsx={question.stem} />
              </div>
              <Select
                id={`${id}::value`}
                value={question.value}
                onChange={(event) =>
                  this.setValue(event, this.setInProgress, this.setIsDisabled)
                }
                disabled={disabled}
                autowidth
              >
                <MenuItem value={0}>-- Select --</MenuItem>
                {responses}
              </Select>
            </FormControl>
          </Box>
        </div>
      );
    } catch (error) {
      return (
        <>
          <b>
            [[{id}]] error "{error.message}"
          </b>
        </>
      );
    }
  }

  onSubmitResponse = async (newState) => {
    // send question response to server and get the
    // new dynamic objects state
    var { data } = await postQuestionValue(newState);

    // bubble up the dynamic object to player since the
    // dynamic objects may be shared to other components
    if (data != null && this.props.props.onUpdateDynamicObjects) {
      this.props.props.onUpdateDynamicObjects(data);
      this.setInProgress(false);
    }
  };
}

export default withStyles(styles)(OlabDropDownQuestion);
