// @flow
import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";

import Spinner from "../../../../shared/assets/loading_med.gif";
import JsxParser from "react-jsx-parser";

import { withStyles } from "@material-ui/core/styles";
import log from "loglevel";

import styles from "../../styles.module.css";
import siteStyles from "../../site.module.css";

import { getQuestion } from "../../WikiUtils";
import OlabTag from "../../OlabTag";

class OlabDropDownQuestion extends OlabTag {
  constructor(props) {
    let olabObject = getQuestion(props.name, props);
    super(props, olabObject);
  }

  setValue = (event, setInProgress, setIsDisabled) => {
    const { debug, olabObject } = this.state;

    const value = Number(event.target.value);

    this.setState((state) => {
      olabObject.value = value;
      log.debug(
        `${this.constructor["name"]}  set question '${olabObject.id}' value = '${value}'.`
      );
      return { question: olabObject };
    });

    let response = null;

    for (let index = 0; index < olabObject.responses.length; index++) {
      response = olabObject.responses[index];
      if (response.id === value) {
        break;
      }
    }

    if (typeof olabObject.responseId == "undefined")
      olabObject.previousResponseId = null;
    else olabObject.previousResponseId = olabObject.responseId;

    olabObject.responseId = response.id;
    olabObject.value = olabObject.responseId;

    log.debug(
      `${this.constructor["name"]}  set question '${olabObject.id}' value = '${value}'`
    );

    // if single try question, disabled it
    if (olabObject.numTries > 0) {
      olabObject.disabled = true;
    }

    // first attempt to answer, so show answer
    // indicators, if called on
    olabObject.showAnswerIndicators = true;

    this.setState({ olabObject });
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
      return this.errorJsx(id, error);
    }
  }
}

export default withStyles(styles)(OlabDropDownQuestion);
