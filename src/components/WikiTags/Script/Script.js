// @flow
import { Log, LogInfo, LogError } from "../../utils/Logger";
import log from "loglevel";

class OlabScriptTag extends React.Component {
  render() {
    const { name } = this.props;

    log.debug(`OlabConstantTag render '${name}'`);

    try {
      /* render it */
    } catch (error) {
      return (
        <>
          <b>
            [[SCRIPT:{name}]] "{error.message}"
          </b>
        </>
      );
    }
  }
}

export default OlabScriptTag;
