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

  onNavigateToNode = (link, mapId, nodeId, urlParam) => {
    if (link.followOnce) {
      var newLinksClicked = playerState.GetLinksClicked();
      newLinksClicked.push(link.id);
      playerState.SetLinksClicked(newLinksClicked);
    }

    this.props.props.onNavigateToNode(mapId, nodeId, urlParam);
  };

  render() {
    log.debug(`${this.constructor["name"]} render`);

    var linksClicked = playerState.GetLinksClicked();

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

    // decorate link with name based on link text
    for (let index = links.length - 1; index >= 0; index--) {
      let link = links[index];
      link.name = "LINK:" + link.linkText.toLowerCase().replace(/[\W_]/g, "");
    }

    // remove link based on visit-once nodes
    for (let index = links.length - 1; index >= 0; index--) {
      const link = links[index];
      if (nodesVisited.includes(link.destinationId)) {
        links.splice(index, 1);
      }
    }

    // remove link based on click-once links
    for (let index = links.length - 1; index >= 0; index--) {
      const link = links[index];
      if (linksClicked.includes(link.id)) {
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
                id={link.name}
                key={link.id}
                onClick={() => {
                  this.onNavigateToNode(
                    link,
                    mapId,
                    link.destinationId,
                    urlParam
                  );
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
                id={link.name}
                key={link.id}
                style={{
                  textTransform: "none",
                  display: link.visible ? "inline" : "none",
                }}
                onClick={() => {
                  this.onNavigateToNode(
                    link,
                    mapId,
                    link.destinationId,
                    urlParam
                  );
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
