// @flow
import { Button } from "@material-ui/core";
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import log from "loglevel";
import JsxParser from "react-jsx-parser";

import styles from "../../styles.module.css";
import siteStyles from "../../site.module.css";
import Spinner from "../../../../shared/assets/loading_med.gif";

import { getQuestion } from "../../WikiTags";
import { postQuestionValue } from "../../../../services/api";
const playerState = require("../../../../utils/PlayerState").PlayerState;

class OlabMultilineTextQuestion extends React.Component {
  constructor(props) {
    super(props);

    log.debug(`${this.constructor["name"]} ctor`);

    let question = getQuestion(this.props.name, this.props);
    const debug = playerState.GetDebug();

    this.state = {
      showProgressSpinner: false,
      disabled: false,
      contentsChanged: false,
      debug,
      question,
      ...props.props,
    };

    // Binding this keyword
    this.setInProgress = this.setInProgress.bind(this);
    this.onSubmitClicked = this.onSubmitClicked.bind(this);
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

  onSubmitClicked = (event) => {
    const question = this.state.question;
    const value = question.value;
    let disabled = this.state.disabled;

    // test if only one respond allowed.  Disable control
    // if this is the case
    if (question.numTries === -1 || question.numTries === 1) {
      this.setState({ disabled: true });
      log.debug(
        `OlabMultilineTextQuestion disabled question '${question.id}' value = '${value}'.`
      );
    }

    this.transmitResponse();

    this.setState({ contentsChanged: false });
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

  onFocus = (event) => {
    log.debug(`onFocus ${event.target.id}`);
  };

  onTextChanged = (event) => {
    const value = event.target.value;
    const question = this.state.question;

    question.value = value;

    // set the question value in trackable state
    this.setState({
      question: question,
      contentsChanged: true,
    });
  };

  render() {
    const { debug, question, contentsChanged, disabled } = this.state;
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

      let valueClasses = [];
      valueClasses.push(styles["qumultiline-value"]);
      if (question.numTries === -1) {
        valueClasses.push(styles["qumultiline-required"]);
      }

      return (
        <div
          className={`${styles["qumultiline"]} ${siteStyles[id]}`}
          id={`${id}`}
        >
          <div id={`${id}::stem`} className={`${styles["qumultiline-stem"]}`}>
            <JsxParser jsx={question.stem} />
          </div>
          <div className={`${styles["qumultiline-value"]}`}>
            <textarea
              rows={`${question.height}`}
              cols={`${question.width}`}
              placeholder={`${question.prompt}`}
              className={`${valueClasses.join(" ")}`}
              id={`${id}::value`}
              value={question.value}
              disabled={disabled}
              onChange={this.onTextChanged}
              onFocus={this.onFocus}
            ></textarea>
          </div>
          <div>
            {contentsChanged && (
              <Button
                variant="contained"
                color="secondary"
                onClick={(event) => this.onSubmitClicked(event)}
              >
                Submit
              </Button>
            )}
            {progressButtonHtml}
          </div>
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

export default withStyles(styles)(OlabMultilineTextQuestion);
