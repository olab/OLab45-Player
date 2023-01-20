// @flow
import React from 'react';
import parse from 'html-react-parser'
import log from 'loglevel';
import { getCounter } from '../WikiTags';
const persistantStorage = require('../../../utils/StateStorage').PersistantStateStorage;

class OlabCounterTag extends React.Component {

  constructor(props) {

    super(props);

    const debug = persistantStorage.get(null, 'debug');
    this.state = {
      ...debug
    };

  }

  render() {

    const {
      name
    } = this.props;

    log.debug(`OlabConstantTag render '${name}'`);

    try {
      let item = getCounter(name, this.props.props.dynamicObjects);

      if (item != null) {

        if (!this.state.enableWikiRendering) {
          return (
            <>
              <b>[[CR:{name}]] "{item.value}"</b>
            </>
          );
        }

        if ( item.value == null ) {
          item.value = "";
        }

        return (
          <>
            {parse(item.value)}
          </>
        );
      }

    } catch (error) {
      return (
        <>
          <b>[[CR:{name}]] "{error.message}"</b>
        </>
      );
    }

    return '';
  }
}

export default OlabCounterTag;
