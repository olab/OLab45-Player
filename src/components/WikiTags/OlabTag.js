// @flow
import React from "react";
import log from "loglevel";

const playerState = require("../../utils/PlayerState").PlayerState;
import { postQuestionValue } from "../../services/api";

class OlabTag extends React.Component {
  constructor(props, olabObject) {
    super(props);

    log.debug(`${this.constructor["name"]} '${props?.name}' ctor`);

    const debug = playerState.GetDebug();

    this.state = {
      olabObject,
      debug,
      ...props.props,
      showProgressSpinner: false,
      disabled: false,
    };

    this.setInProgress = this.setInProgress.bind(this);
  }

  componentWillUnmount() {
    const { id } = this.props;
    log.debug(`${this.constructor["name"]} '${id}' componentWillUnmount`);
  }

  setInProgress(inProgress) {
    const { name } = this.props;
    this.setState({ showProgressSpinner: inProgress });
    log.debug(
      `${this.constructor["name"]}: '${name}' set progress spinner: ${inProgress}`
    );
  }

  setIsDisabled(disabled) {
    const { name } = this.props;
    this.setState({ disabled: disabled });
    log.debug(
      `${this.constructor["name"]}: '${name}' set disabled: ${disabled}`
    );
  }

  onSubmitResponse = async (newState) => {
    try {
      // send question response to server and get the
      // new dynamic objects state
      var { data } = await postQuestionValue(newState);

      // bubble up the dynamic object to player since the
      // dynamic objects may be shared to other components
      if (data != null && this.props.props.onUpdateDynamicObjects) {
        this.props.props.onUpdateDynamicObjects(data);
      }
    } catch (error) {
      log.error(`${this.constructor["name"]}: onSubmitResponse: ${error}`);
    }

    this.setInProgress(false);
  };

  errorJsx = (id, error) => {
    log.error(`[[${id}]] error ${error.message}`);

    return (
      <>
        <b>
          [[{id}]] error "{error.message}"
        </b>
      </>
    );
  };
}

export default OlabTag;
