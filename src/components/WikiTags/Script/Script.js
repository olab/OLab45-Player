// @flow
import log from 'loglevel';
const persistantStorage = require('../../../utils/StateStorage').PersistantStateStorage;
import OLabClientApi from './OLabClientApi'

class OlabScriptTag extends React.Component {

  render() {

    const {
      name
    } = this.props;

    log.debug(`OlabConstantTag render '${name}'`);

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
