// @flow
import React from "react";
import parse from "html-react-parser";
import log from "loglevel";

import { getCounter } from "../WikiUtils";
import OlabTag from "../OlabTag";

class OlabCounterTag extends OlabTag {
  constructor(props) {
    let olabObject = getCounter(props.name, props.props.dynamicObjects);
    super(props, olabObject);
  }

  render() {
    const { debug, olabObject } = this.state;
    const { id, name } = this.props;

    log.debug(`${this.constructor["name"]} render`);

    try {
      if (olabObject == null) {
        throw new Error(`'${name}' not found`);
      }

      if (debug.disableWikiRendering) {
        return (
          <>
            <b>
              [[{id}]] ({olabObject.id}) "{olabObject.value}"
            </b>
          </>
        );
      }

      if (olabObject.value == null) {
        olabObject.value = "";
      }

      return (
        <div id={olabObject.htmlIdBase} style={{ display: "inline" }}>
          {parse(olabObject.value)}
        </div>
      );
    } catch (error) {
      return this.errorJsx(id, error);
    }
  }
}

export default OlabCounterTag;
