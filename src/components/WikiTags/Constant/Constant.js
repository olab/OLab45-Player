// @flow
import React from 'react';
import parse from 'html-react-parser'
import log from 'loglevel';
import { getConstant } from '../WikiTags';
const persistantStorage = require('../../../utils/StateStorage').PersistantStateStorage;

class OlabConstantTag extends React.Component {

  render() {

    const {
      name
    } = this.props;

    log.debug(`OlabConstantTag render '${name}'`);

    try {
      let item = getConstant(name, this.props);

      if (item != null) {

        if (persistantStorage.get('dbg-disableWikiRendering')) {
          return (
            <>
              <b>[[CONST:{name}]] "{item.value}"</b>
            </>
          );
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
          <b>[[CONST:{name}]] "{error.message}"</b>
        </>
      );
    }
  }
}

export default OlabConstantTag;
