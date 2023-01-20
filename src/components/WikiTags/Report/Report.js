// @flow
import React from 'react';
import parse from 'html-react-parser'
import log from 'loglevel';
import { getConstant } from '../WikiTags';
const playerState = require('../../../utils/PlayerState').PlayerState;

class OlabReportTag extends React.Component {

  constructor(props) {

    const debug = playerState.GetDebug();
    this.state = { debug };

  }

  render() {

    const { debug } = this.state;

    log.debug(`OlabReportTag render`);

    try {

        if (!debug.enableWikiRendering) {
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
