// @flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import log from "loglevel";
import JsxParser from "react-jsx-parser";

import styles from "../../styles.module.css";
import siteStyles from "../../site.module.css";

import { getQuestion } from "../../WikiTags";
import { postQuestionValue } from "../../../../services/api";

class OlabSinglelineTextQuestion extends React.Component {
  constructor(props) {
    super(props);

    log.debug(`${this.constructor["name"]} ctor`);

    let question = getQuestion(this.props.name, this.props);

    this.state = {
      question,
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
      question,
      // disabled
    } = this.state;
    const { id, name } = this.props;

    log.debug(`OlabSinglePickQuestion render '${name}'`);

    try {
      return (
        <>
          <div
            className={`${styles["qusingleline"]} ${siteStyles[id]}`}
            id={`${id}`}
          >
            <div
              id={`${id}::stem`}
              className={`${styles["qusingleline-stem"]}`}
            >
              <JsxParser jsx={question.stem} />
            </div>

            <div className={`${styles["qusingleline-value"]}`}>
              <form
                onSubmit={(event) => this.setValue(event, this.setInProgress)}
              >
                <input
                  className={`${styles["qusingleline-value"]}`}
                  id={`${id}::value`}
                  value={question.value}
                  placeholder={`${question.prompt}`}
                  onChange={this.handleChange}
                ></input>
                <input type="submit" hidden />
              </form>
            </div>
          </div>
        </>
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
    }
  };
}

export default withStyles(styles)(OlabSinglelineTextQuestion);
