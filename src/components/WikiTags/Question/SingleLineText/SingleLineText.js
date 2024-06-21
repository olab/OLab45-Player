// @flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { Log, LogInfo, LogError } from "../../../../utils/Logger";
import log from "loglevel";

import styles from "../../styles.module.css";
import siteStyles from "../../site.module.css";

class OlabSinglelineTextQuestion extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // id: props.props.id,
      // name: props.props.name,
      // question: props.props.question,
      // dynamicObjects: props.props.dynamicObjects,
      showProgressSpinner: false,
      disabled: false,
      ...props.props,
    };

    // Binding this keyword
    this.setInProgress = this.setInProgress.bind(this);
    this.setValue = this.setValue.bind(this);
    this.transmitResponse = this.transmitResponse.bind(this);
  }

  setValue = (event, setInProgress) => {
    const question = this.state.question;
    const value = question.value;
    let disabled = this.state.disabled;

    // test if only one respond allowed.  Disable control
    // if this is the case
    if (question.numTries === -1 || question.numTries === 1) {
      this.setState((state) => {
        disabled = true;
        log.debug(
          `OlabSinglelineTextQuestion disabled question '${question.id}' value = '${value}'.`
        );
        return { disabled };
      });
    }

    this.transmitResponse();
    // this is needed to prevent the default, page-refreshing, submit to occur.
    event.preventDefault();
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

  setIsDisabled(disabled) {
    this.setState({ disabled: disabled });
    log.debug(`set disabled: ${disabled}`);
  }

  handleChange = (event) => {
    const value = event.target.value;
    const question = this.state.question;

    // set the question value in trackable state
    this.setState((state) => {
      question.value = value;
      return { question };
    });
  };

  render() {
    const {
      id,
      name,
      question,
      // disabled
    } = this.state;

    log.debug(`OlabSinglePickQuestion render '${name}'`);

    try {
      return (
        <>
          <span
            className={`${styles["qusingleline"]} ${siteStyles[id]}`}
            id={`${id}`}
          >
            <span
              id={`${id}/stem`}
              className={`${styles["qusingleline-stem"]}  ${siteStyles[id]}`}
            >
              {question.stem}
            </span>
            <span className={`${styles["qusingleline-value-container"]}`}>
              <form
                onSubmit={(event) => this.setValue(event, this.setInProgress)}
              >
                <input
                  className={`${styles["qusingleline-value"]}`}
                  id={`${id}/value`}
                  value={question.value}
                  placeholder={`${question.prompt}`}
                  onChange={this.handleChange}
                ></input>
                <input type="submit" hidden />
              </form>
            </span>
          </span>
        </>
      );
    } catch (error) {
      return (
        <>
          <b>
            [[QU:{id}]] "{error.message}"
          </b>
        </>
      );
    }
  }
}

export default withStyles(styles)(OlabSinglelineTextQuestion);
