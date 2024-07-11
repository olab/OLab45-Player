// @flow
import React from "react";
import log from "loglevel";

const playerState = require("../../utils/PlayerState").PlayerState;
import { postQuestionValue } from "../../services/api";

class OlabTag extends React.Component {
  constructor(props, olabObject) {
    super(props);

    log.debug(`${this.constructor["name"]} ctor`);

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
    this.setState({ showProgressSpinner: inProgress });
    log.debug(`set progress spinner: ${inProgress}`);
  }

  setIsDisabled(disabled) {
    this.setState({ disabled: disabled });
    log.debug(`set disabled: ${disabled}`);
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
