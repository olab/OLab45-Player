// @flow
import React from "react";
import { Box, Typography, Slider } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import log from "loglevel";
import JsxParser from "react-jsx-parser";

import styles from "../../styles.module.css";
import siteStyles from "../../site.module.css";

import { getQuestion } from "../../WikiUtils";
import OlabTag from "../../OlabTag";
// const playerState = require("../../../../utils/PlayerState").PlayerState;
import { PlayerState } from "../../../../utils/PlayerState";
const playerState = new PlayerState();

class OlabSliderQuestion extends OlabTag {
  constructor(props) {
    let olabObject = getQuestion(props.name, props);
    super(props, olabObject);

    const debug = PlayerState.GetDebug();

    this.state = {
      debug,
      olabObject,
      ...props.props,
    };

    // post initial value to server if initializine
    // question value
    if (typeof this.state.olabObject.previousValue == "undefined") {
      // eslint-disable-next-line
      const settings = JSON.parse(this.state.olabObject.settings);
      if (typeof settings.defaultValue != "undefined") {
        this.state.olabObject.value = Number(settings.defaultValue);
      }
    }

    // Binding this keyword
    this.setInProgress = this.setInProgress.bind(this);
    this.setValue = this.setValue.bind(this);
    this.transmitResponse = this.transmitResponse.bind(this);
  }

  setValue = (event, value) => {
    const olabObject = this.state.olabObject;
    log.debug(
      `${this.constructor["name"]}  set question '${olabObject.id}' value = '${value}'`
    );

    this.setState(
      (state) => {
        olabObject.previousValue = olabObject.value;
        olabObject.value = value;

        return { olabObject };
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

  render() {
    const { debug, olabObject } = this.state;
    const { id, name } = this.props;

    log.debug(`${this.constructor["name"]} '${name}' render`);

    try {
      // eslint-disable-next-line
      const settings = JSON.parse(olabObject.settings);
      olabObject.width = 200; // use fixed width - @see https://olabrats.atlassian.net/browse/OD-28

      if (debug.disableWikiRendering) {
        return (
          <>
            <b>
              [[{id}]] ({olabObject.id})
            </b>
          </>
        );
      }

      return (
        <div
          className={`${styles["quslider"]} ${siteStyles[id]}`}
          id={olabObject.htmlIdBase}
          olabid={olabObject.id}
        >
          <Box
            width={olabObject.width}
            className={
              "hor" != settings.orientation
                ? styles["quslider_box_vertical"]
                : ""
            }
          >
            <Typography
              id={`${olabObject.htmlIdBase}::stem`}
              component="span"
              gutterBottom
            >
              <JsxParser jsx={olabObject.stem} />
            </Typography>
            <input
              readOnly
              className={`${styles["quslider-value"]}`}
              id={`${olabObject.htmlIdBase}::input`}
              value={olabObject.value}
            ></input>
            <Slider
              defaultValue={olabObject.value}
              onChangeCommitted={(event, value) => this.setValue(event, value)}
              step={Number(settings.stepValue)}
              orientation={
                "hor" != settings.orientation ? "vertical" : "horizontal"
              }
              marks
              name={`${olabObject.htmlIdBase}::slider`}
              min={Number(settings.minValue)}
              max={Number(settings.maxValue)}
              track={false}
              valueLabelDisplay="auto"
            />
          </Box>
        </div>
      );
    } catch (error) {
      return this.errorJsx(id, error);
    }
  }
}

export default withStyles(styles)(OlabSliderQuestion);
