// @flow
import React from 'react';
import parse from 'html-react-parser'
import log from 'loglevel';
import { getConstant } from '../WikiTags';
const persistantStorage = require('../../../utils/StateStorage').PersistantStateStorage;

class OlabReportTag extends React.Component {

  render() {

    log.debug(`OlabReportTag render`);

    try {

        if (persistantStorage.get('dbg-disableWikiRendering')) {
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
