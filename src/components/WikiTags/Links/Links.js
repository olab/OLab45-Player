// @flow
import React from "react";
// import { withStyles } from '@material-ui/core/styles';
import { Button, ButtonGroup } from "@material-ui/core";
import log from "loglevel";
const playerState = require("../../../utils/PlayerState").PlayerState;
import { config } from "../../../config";

import OlabTag from "../OlabTag";

class OlabLinksTag extends OlabTag {
  constructor(props) {
    super(props);
  }

  onNavigateToNode = (mapId, nodeId, urlParam) => {
    let url = `${config.APP_BASEPATH}/${mapId}/${nodeId}`;
    if (urlParam) {
      url += `/${urlParam}`;
    }

    log.debug(`navigating to ${url}`);

    window.location.href = url;
  };

  render() {
    log.debug(`${this.constructor["name"]} render`);

    const { debug } = this.state;

    const {
      className,
      props: {
        urlParam,
        map: { id: mapId },
        node: { links },
        nodesVisited,
      },
    } = this.props;

    for (let index = links.length - 1; index >= 0; index--) {
      const link = links[index];
      if (nodesVisited.includes(link.destinationId)) {
        links.splice(index, 1);
      }
    }

    if (debug.disableWikiRendering) {
      return (
        <div className={className}>
          <ButtonGroup
            orientation="vertical"
            color="primary"
            aria-label="vertical contained primary button group"
            variant="contained"
          >
            {links.map((link) => (
              <Button
                key={link.id}
                onClick={() => {
                  this.onNavigateToNode(mapId, link.destinationId, urlParam);
                }}
              >
                {link.destinationTitle} (id: {link.id} -&gt;{" "}
                {link.destinationId})
              </Button>
            ))}
          </ButtonGroup>
        </div>
      );
    } else {
      return (
        <div className={className}>
          <ButtonGroup
            orientation="vertical"
            color="primary"
            aria-label="vertical contained primary button group"
            variant="contained"
          >
            {links.map((link) => (
              <Button
                key={link.id}
                style={{ textTransform: "none" }}
                onClick={() => {
                  this.onNavigateToNode(mapId, link.destinationId, urlParam);
                }}
              >
                {link.linkText}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      );
    }
  }
}

export default OlabLinksTag;
