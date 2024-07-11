// @flow
import React from "react";
import parse from "html-react-parser";
import log from "loglevel";

import { getConstant } from "../WikiUtils";
import OlabTag from "../OlabTag";

class OlabConstantTag extends OlabTag {
  constructor(props) {
    let olabObject = getConstant(props.name, props);
    super(props, olabObject);
  }

  render() {
    const { debug, olabObject } = this.state;
    const { id, name } = this.props;

    log.debug(`${this.constructor["name"]} '${name}' render`);

    try {
      if (olabObject == null) {
        throw new Error(`'${name}' not found`);
      }

      if (debug.disableWikiRendering) {
        return (
          <>
            <b>
              [[{id}]] ({olabObject.id}) "{parse(olabObject.value)}"
            </b>
          </>
        );
      }

      return <span id={name}>{parse(olabObject.value)}</span>;
    } catch (error) {
      return this.errorJsx(id, error);
    }
  }
}

export default OlabConstantTag;
