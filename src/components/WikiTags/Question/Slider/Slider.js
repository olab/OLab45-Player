// @flow
import React from "react";
import { Box, Typography, Slider } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import log from "loglevel";
import JsxParser from "react-jsx-parser";

import styles from "../../styles.module.css";
import siteStyles from "../../site.module.css";

import { getQuestion } from "../../WikiTags";
import { postQuestionValue } from "../../../../services/api";
const playerState = require("../../../../utils/PlayerState").PlayerState;

class OlabSliderQuestion extends React.Component {
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

    // post initial value to server if initializine
    // question value
    if (typeof this.state.question.previousValue == "undefined") {
      // eslint-disable-next-line
      const settings = JSON.parse(this.state.question.settings);
      if (typeof settings.defaultValue != "undefined") {
        this.state.question.value = Number(settings.defaultValue);
      }
    }

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

  setValue = (event, value) => {
    const question = this.state.question;
    log.debug(
      `${this.constructor["name"]}  set question '${question.id}' value = '${value}'`
    );

    this.setState(
      (state) => {
        question.previousValue = question.value;
        question.value = value;

        return { question };
      },
      () => this.transmitResponse()
    );
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

  setInProgress(inProgress) {
    this.setState({ showProgressSpinner: inProgress });
    log.debug(`set progress spinner: ${inProgress}`);
  }

  render() {
    const { debug, question } = this.state;
    const { id, name } = this.props;

    log.debug(`${this.constructor["name"]}  render '${name}'`);

    try {
      // eslint-disable-next-line
      const settings = JSON.parse(question.settings);
      question.width = 200; // use fixed width - @see https://olabrats.atlassian.net/browse/OD-28

      if (debug.disableWikiRendering) {
        return (
          <>
            <b>
              [[{id}]] ({question.id})
            </b>
          </>
        );
      }

      return (
        <div className={`${styles["quslider"]} ${siteStyles[id]}`} id={`${id}`}>
          <Box
            width={question.width}
            className={
              "hor" != settings.orientation
                ? styles["quslider_box_vertical"]
                : ""
            }
          >
            <Typography id={`${id}/stem`} component="span" gutterBottom>
              <JsxParser jsx={question.stem} />
            </Typography>
            <input
              readOnly
              className={`${styles["quslider-value"]}`}
              id={`${id}/value`}
              value={question.value}
            ></input>
            <Slider
              defaultValue={question.value}
              onChangeCommitted={(event, value) => this.setValue(event, value)}
              step={Number(settings.stepValue)}
              orientation={
                "hor" != settings.orientation ? "vertical" : "horizontal"
              }
              marks
              name={`${id}-slider`}
              min={Number(settings.minValue)}
              max={Number(settings.maxValue)}
              track={false}
              valueLabelDisplay="auto"
            />
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

export default withStyles(styles)(OlabSliderQuestion);
