// @flow
import React from "react";
import { Box, Typography, Slider } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { Log, LogInfo, LogError } from "../../../../utils/Logger";
import log from "loglevel";

import styles from "../../styles.module.css";
import siteStyles from "../../site.module.css";

class OlabSliderQuestion extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
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

  setValue = (event, value) => {
    const question = this.state.question;
    log.debug(
      `OlabSliderQuestion set question '${question.id}' value = '${value}'`
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
    const { onSubmitResponse, authActions, map, node, contextId } =
      this.props.props;

    let responseState = {
      ...this.state,
      authActions,
      map,
      node,
      contextId,
      setInProgress: this.setInProgress,
      setIsDisabled: this.setIsDisabled,
    };

    if (typeof onSubmitResponse !== "undefined") {
      onSubmitResponse(responseState);
    }
  }

  setInProgress(inProgress) {
    this.setState({ showProgressSpinner: inProgress });
    log.debug(`set progress spinner: ${inProgress}`);
  }

  render() {
    const {
      id,
      name,
      question,
      // disabled
    } = this.state;

    log.debug(`OlabSliderQuestion render '${name}'`);

    try {
      // eslint-disable-next-line
      const settings = JSON.parse(question.settings);
      question.width = 200; // use fixed width - @see https://olabrats.atlassian.net/browse/OD-28

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
            <Typography id={`${id}/stem`} component="div" gutterBottom>
              {question.stem}
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
            [[{id}]] "{error.message}"
          </b>
        </>
      );
    }
  }
}

export default withStyles(styles)(OlabSliderQuestion);
