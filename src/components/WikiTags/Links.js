// @flow
import React from 'react';
// import { withStyles } from '@material-ui/core/styles';
import {
  Button,
  ButtonGroup,
} from '@material-ui/core';
import log from 'loglevel';
const playerState = require('../../utils/PlayerState').PlayerState;

class OlabLinksTag extends React.Component {

  constructor(props) {

    super(props);

    const debug = playerState.GetDebug();

    this.state = { debug };

  }

  onNavigateToNode = (mapId, nodeId, urlParam) => {

    let url = `/player/player/${mapId}/${nodeId}`;
    if (urlParam) {
      url += `/${urlParam}`;
    }

    log.debug(`navigating to ${url}`)

    window.location.href = url;
  }

  render() {
    log.debug('OlabLinksTag render');

    const { debug } = this.state;

    const {
      className,
      props: {
        urlParam,
        map: {
          id: mapId,
        },
        node: {
          links,
        },
        nodesVisited,
      },
    } = this.props;

    for (let index = links.length - 1; index >= 0; index--) {
      const link = links[index];
      if (nodesVisited.includes(link.destinationId)) {
        links.splice(index, 1);
      }

    }

    if (debug.enableWikiRendering) {

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
                onClick={() => { this.onNavigateToNode(mapId, link.destinationId, urlParam); }}
              >
                {link.linkText}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      );

    }
    else {

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
                onClick={() => { this.onNavigateToNode(mapId, link.destinationId, urlParam); }}
              >
                {link.destinationTitle} (id: {link.id} -&gt; {link.destinationId})
              </Button>
            ))}
          </ButtonGroup>
        </div>
      );

    }
  }
}

export default OlabLinksTag;
