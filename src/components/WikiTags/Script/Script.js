// @flow
import { Log, LogInfo, LogError } from '../../utils/Logger';

class OlabScriptTag extends React.Component {

  render() {

    const {
      name
    } = this.props;

    Log(`OlabConstantTag render '${name}'`);

    try {

      /* render it */

    } catch (error) {
      return (
        <>
          <b>[[SCRIPT:{name}]] "{error.message}"</b>
        </>
      );
    }
  }
}

export default OlabScriptTag;
