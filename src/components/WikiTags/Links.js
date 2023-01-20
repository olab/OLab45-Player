// @flow
import React from 'react';
// import { withStyles } from '@material-ui/core/styles';
import {
  Button,
  ButtonGroup,
} from '@material-ui/core';
import log from 'loglevel';
const persistantStorage = require('../../utils/StateStorage').PersistantStateStorage;

class OlabLinksTag extends React.Component {

  constructor(props) {

    super(props);

    const debug = persistantStorage.get( null, 'debug');
    this.state = {
      ...debug
    };

  }

  onNavigateToNode = (mapId, nodeId, urlParam) => {

    let url = `/player/player/${mapId}/${nodeId}`;
    if (urlParam) {
      url += `/${urlParam}`;
    }

    log.debug(`navigating to ${url}`)

    // save visited node to list so 'visit-once' nodes can be 
    // suppressed later.
    // var visitedNodes = persistantStorage.get( null, 'visit-once-nodes', []);
    // if (!visitedNodes.includes(nodeId)) {
    //   visitedNodes.push(nodeId);
    //   log.debug(`saving visited node id: ${nodeId}`);
    //   persistantStorage.save( null, 'visit-once-nodes', visitedNodes);
    // }

    window.location.href = url;
  }

  render() {
    log.debug('OlabLinksTag render');

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

    if (this.state.enableWikiRendering) {

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
