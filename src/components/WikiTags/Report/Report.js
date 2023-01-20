// @flow
import React from 'react';
import parse from 'html-react-parser'
import log from 'loglevel';
import { getConstant } from '../WikiTags';
const persistantStorage = require('../../../utils/StateStorage').PersistantStateStorage;

class OlabReportTag extends React.Component {

  constructor(props) {

    const debug = persistantStorage.get( null, 'debug');
    this.state = {
      ...debug
    };

  }

  render() {

    log.debug(`OlabReportTag render`);

    try {

        if (!this.state.enableWikiRendering) {
          return (
            <>
              <b>[[REPORT]]</b>
            </>
          );
        }

        return (
          <>
              <b>[[REPORT]]</b>
          </>
        );
      }
    } catch (error) {
      return (
        <>
          <b>[[REPORT]] "{error.message}"</b>
        </>
      );
    }
  }
}

export default OlabReportTag;
