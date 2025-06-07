// @flow
import { Button } from "@material-ui/core";
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import log from "loglevel";
import JsxParser from "react-jsx-parser";

import styles from "../../styles.module.css";
import siteStyles from "../../site.module.css";
import Spinner from "../../../../shared/assets/loading_med.gif";

import { getQuestion } from "../../WikiUtils";
import OlabTag from "../../OlabTag";
const playerState = require("../../../../utils/PlayerState").PlayerState;

class OlabMultilineTextQuestion extends OlabTag {
  constructor(props) {
    let olabObject = getQuestion(props.name, props);
    super(props, olabObject);

    const debug = playerState.GetDebug();

    this.state = {
      showProgressSpinner: false,
      disabled: false,
      contentsChanged: false,
      debug,
      olabObject,
      ...props.props,
    };

    // Binding this keyword
    this.setInProgress = this.setInProgress.bind(this);
    this.onSubmitClicked = this.onSubmitClicked.bind(this);
    this.transmitResponse = this.transmitResponse.bind(this);
  }

  onSubmitClicked = (event) => {
    const olabObject = this.state.olabObject;
    const value = olabObject.value;
    let disabled = this.state.disabled;

    // test if only one respond allowed.  Disable control
    // if this is the case
    if (olabObject.numTries === -1 || olabObject.numTries === 1) {
      this.setState({ disabled: true });
      log.debug(
        `${this.constructor["name"]} disabled question '${olabObject.id}' value = '${value}'.`
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
    const olabObject = this.state.olabObject;

    olabObject.value = value;

    // set the question value in trackable state
    this.setState({
      olabObject: olabObject,
      contentsChanged: true,
    });
  };

  render() {
    const { debug, olabObject, contentsChanged, disabled } = this.state;
    const { id, name } = this.props;

    log.debug(`${this.constructor["name"]} '${name}' render`);

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
              [[{id}]] ({olabObject.id})
            </b>
          </>
        );
      }

      let valueClasses = [];
      valueClasses.push(styles["qumultiline-value"]);
      if (olabObject.numTries === -1) {
        valueClasses.push(styles["qumultiline-required"]);
      }

      const visibility = this.getDisplayStyle(olabObject);
      const divStyle = {
        display: visibility,
      };

      return (
        <div
          className={`${styles["qumultiline"]} ${siteStyles[id]}`}
          id={olabObject.htmlIdBase}
          olabid={olabObject.id}
          style={divStyle}
        >
          <div
            id={`${olabObject.htmlIdBase}::stem`}
            className={`${styles["qumultiline-stem"]}`}
          >
            <JsxParser jsx={olabObject.stem} />
          </div>
          <div className={`${styles["qumultiline-value"]}`}>
            <textarea
              rows={`${olabObject.height}`}
              cols={`${olabObject.width}`}
              placeholder={`${olabObject.prompt}`}
              className={`${valueClasses.join(" ")}`}
              id={`${olabObject.htmlIdBase}::value`}
              value={olabObject.value}
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
      return this.errorJsx(id, error);
    }
  }
}

export default withStyles(styles)(OlabMultilineTextQuestion);
