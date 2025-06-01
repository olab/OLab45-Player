// @flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import log from "loglevel";
import JsxParser from "react-jsx-parser";

import styles from "../../styles.module.css";
import siteStyles from "../../site.module.css";

import { getQuestion, getDisplay } from "../../WikiUtils";
import OlabTag from "../../OlabTag";
const playerState = require("../../../../utils/PlayerState").PlayerState;

class OlabSinglelineTextQuestion extends OlabTag {
  constructor(props) {
    let olabObject = getQuestion(props.name, props);
    super(props, olabObject);

    const debug = playerState.GetDebug();

    this.state = {
      showProgressSpinner: false,
      disabled: false,
      debug,
      olabObject,
      ...props.props,
    };

    // Binding this keyword
    this.setInProgress = this.setInProgress.bind(this);
    this.setValue = this.setValue.bind(this);
    this.transmitResponse = this.transmitResponse.bind(this);
  }

  setValue = (event, setInProgress) => {
    const olabObject = this.state.olabObject;
    const value = olabObject.value;
    let disabled = this.state.disabled;

    // test if only one respond allowed.  Disable control
    // if this is the case
    if (olabObject.numTries === -1 || olabObject.numTries === 1) {
      this.setState((state) => {
        disabled = true;
        log.debug(
          `${this.constructor["name"]} disabled question '${olabObject.id}' value = '${value}'.`
        );
        return { disabled };
      });
    }

    this.transmitResponse();
    // this is needed to prevent the default, page-refreshing, submit to occur.
    event.preventDefault();
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

  handleChange = (event) => {
    const value = event.target.value;
    const olabObject = this.state.olabObject;

    // set the olabObject value in trackable state
    this.setState((state) => {
      olabObject.value = value;
      return { olabObject };
    });
  };

  render() {
    const { debug, olabObject } = this.state;
    const { id, name } = this.props;

    log.debug(`${this.constructor["name"]} '${name}' render`);

    try {
      if (debug.disableWikiRendering) {
        return (
          <>
            <b>
              [[{id}]] ({olabObject.id})
            </b>
          </>
        );
      }

      const visibility = getDisplay(olabObject);
      const divStyle = {
        display: visibility,
      };

      return (
        <>
          <div
            className={`${styles["qusingleline"]} ${siteStyles[id]}`}
            id={olabObject.htmlIdBase}
            olabid={olabObject.id}
            style={divStyle}
          >
            <div
              id={`${olabObject.htmlIdBase}::stem`}
              className={`${styles["qusingleline-stem"]}`}
            >
              <JsxParser jsx={olabObject.stem} />
            </div>

            <div className={`${styles["qusingleline-value"]}`}>
              <form
                onSubmit={(event) => this.setValue(event, this.setInProgress)}
              >
                <input
                  className={`${styles["qusingleline-value"]}`}
                  id={`${olabObject.htmlIdBase}::value`}
                  value={olabObject.value}
                  placeholder={`${olabObject.prompt}`}
                  onChange={this.handleChange}
                ></input>
                <input type="submit" hidden />
              </form>
            </div>
          </div>
        </>
      );
    } catch (error) {
      return this.errorJsx(id, error);
    }
  }
}

export default withStyles(styles)(OlabSinglelineTextQuestion);
