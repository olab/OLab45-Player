import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { FormControl } from '@material-ui/core';
import JsxParser from 'react-jsx-parser';
import log from 'loglevel';

import OlabConstantTag from '../WikiTags/Constant/Constant';
import OlabCountersTag from '../WikiTags/Counters/Counter';
import OlabCounterTag from '../WikiTags/Counter/Counter';
import OlabLinksTag from '../WikiTags/Links';
import OlabMediaResourceTag from '../WikiTags/MediaResource/MediaResource';
import OlabQuestionTag from '../WikiTags/Question/Question';
import OlabAttendeeTag from '../WikiTags/Question/TurkTalk/Turkee/Turkee';
import OlabModeratorTag from '../WikiTags/Question/TurkTalk/Turker/Turker';
import { withParams } from "../ComponentWrapper";

import styles from './styles';
import {
  getMap,
  getMapScopedObjects,
  getMapNode,
  getNodeScopedObjects,
  getServerScopedObjects,
  getDynamicScopedObjects
} from '../../services/api';

const playerState = require('../../utils/PlayerState').PlayerState;

class Player extends PureComponent {

  constructor(props) {
    
    super(props);

    log.enableAll();

    const { mapId, nodeId } = arguments[0].params;
    log.info(`playing map ${mapId}, node ${nodeId}`);

    this.state = {
      isMounted: false,
      signalRConnection: null,
    };

    this.getServer = this.getServer.bind(this);
    this.getMap = this.getMap.bind(this);
    this.getNode = this.getNode.bind(this);
    this.onUpdateDynamicObjects = this.onUpdateDynamicObjects.bind(this);

    if (this.state.disableCache) {

      log.info(`disabled cache`);
      playerState.clear(null);

    }
    else {

      const persistedState = playerState.Get();

      this.state = {
        ...this.state,
        ...persistedState
      }

    }

    // eslint-disable-next-line
    window.addEventListener('popstate', function (event) {
      // eslint-disable-next-line
      history.pushState(null, document.title, location.href);
      alert('Back button disabled during case play.');
    });

  }

  async componentDidMount() {

    this.setState({ mapId: this.props.params.mapId });
    this.setState({ nodeId: this.props.params.nodeId });

    await this.getServer(this.props, 1);
    await this.getMap(this.props);
    await this.getNode(this.props);

    this.setState({ isMounted: true });
  }

  lookupTheme = () => {

    let theme = null;

    try {
      const { scopedObjects: { map, server } } = this.state;

      if (server.themes.length > 0) {
        theme = server.themes[0];
      }

      if (map.themes.length > 0) {
        theme = map.themes[0];
      }

    } catch (error) {
      log.error(error);
    }

    if (theme) {
      log.debug(`found theme: '${theme.name}' (${theme.id}). parent: '${theme.imagetype}' (${theme.parentId})`);
    }
    return theme;

  }

  getServer = async (props, id) => {

    try {

      // test if already have server loaded
      var { scopedObjects: { server }, disableCache } = this.state;

      if (server && !disableCache) {
        this.setState({ isServerFetched: true });
        log.debug('using cached server data');
        return;
      }

      const { data: scopedObjectsData } = await getServerScopedObjects(props, id);
      const { scopedObjects } = this.state;

      this.setState({
        scopedObjects: {
          map: scopedObjects.map,
          node: scopedObjects.node,
          server: scopedObjectsData
        }
      });

      if (!this.state.disableCache) {
        playerState.SetServerStatic( null, this.state.scopedObjects.server );
      }

      log.debug('read server data');

    } catch (error) {
      log.error(error);
    }
  }

  getMap = async (props) => {

    try {

      // test if already have map loaded (and it's the same one)
      var { map, disableCache } = this.state;
      let { mapId: id } = this.state;

      if (map && !disableCache) {

        if (Number(id) === map.id) {
          this.setState({ isMapFetched: true });
          log.debug('using cached map data');
          return;
        }

      }

      const { data: objData } = await getMap(props, id);
      const { data: scopedObjectsData } = await getMapScopedObjects(props, id);
      const { scopedObjects } = this.state;

      this.setState({
        map: objData,
        scopedObjects: {
          map: scopedObjectsData,
          node: scopedObjects.node,
          server: scopedObjects.server
        }
      });

      if (!this.state.disableCache) {
        playerState.SetMapStatic( null, this.state.scopedObjects.map );
        playerState.SetMap( null, this.state.map);
      }

      log.debug('read map data');

    } catch (error) {
      log.error(error);
    }

  }

  getNode = async (props) => {

    try {

      let {
        mapId,
        nodeId,
        dynamicObjects,
        node,
        disableCache
      } = this.state;

      // reset nodes visited if entering map via 'root node'
      if (nodeId === 0) {
        this.setState({ nodesVisited: [] });
        playerState.SetNodesVisited(null, []);
      }

      // test if already have node loaded (and it's the same one)
      if (node && !disableCache) {
        if (Number(nodeId) === node.id) {
          log.debug('using cached node data');
          return;
        }
      }

      // if no dynamic objects yet, initialize an object
      if (!dynamicObjects) {
        dynamicObjects = {
          map: null,
          node: null,
          server: null
        };
      }

      const { data: nodeData } = await getMapNode(props, mapId, nodeId, dynamicObjects);
      const { data: scopedObjectsData } = await getNodeScopedObjects(props, nodeData.id);
      const { scopedObjects } = this.state;

      // delete the dynamic objects that piggy-back 
      // on the node object
      dynamicObjects = nodeData.dynamicObjects;
      delete nodeData.dynamicObjects;

      // if root node, save the new contextId
      if (nodeData.typeId === 1) {
        playerState.SetContextId( null, nodeData.contextId);

      }
      else {
        nodeData.contextId = playerState.GetContextId( null );
      }

      log.info(`contextId: ${nodeData.contextId}`);

      this.setState({
        contextId: nodeData.contextId,
        node: nodeData,
        dynamicObjects: dynamicObjects,
        scopedObjects: {
          map: scopedObjects.map,
          node: scopedObjectsData,
          server: scopedObjects.server
        }
      });

      if (!this.state.disableCache) {
        playerState.SetNode( null, this.state.node);
        playerState.SetDynamicObjects( null, this.state.dynamicObjects);        
        playerState.SetNodeStatic( null, this.state.scopedObjects.node);        
      }

      log.debug('read node data');

    } catch (error) {
      log.error(error);
    }

  }

  setCounterChange = (state) => {
    alert(state);
  }

  getDynamic = async (props, state) => {

    try {

      this.setState({ isDynamicFetched: false });
      const { data: scopedObjectsData } = await getDynamicScopedObjects(props, state.mapId, state.nodeId);

      this.setState({
        dynamicObjects: scopedObjectsData
      });

      playerState.SetDynamicObjects( null, this.state.dynamicObjects);

      log.debug('read dynamic data');

    } catch (error) {
      log.error(error);
    }

  }

  setPageTitle = (mapTitle, nodeTitle) => {
    document.title = `${mapTitle} | ${nodeTitle}`;
  }

  onNavigateToNode = (mapId, nodeId, urlParam) => {

    let url = `/player/${mapId}/${nodeId}`;
    if (urlParam) {
      url += `/${urlParam}`;
    }

    log.debug(`navigating to ${url}`)
    window.location.href = url;
  }

  onUpdateDynamicObjects = (dynamicObjects) => {
    this.setState({ dynamicObjects: dynamicObjects });
    playerState.SetDynamicObjects( null, this.state.dynamicObjects);
  }

  onJsxParseError(arg) {
    const t = arg;
    log.error(t);
    alert(`Renderer error: ${t}`);
  }

  render() {

    const {
      debug,
      isMounted,
      map,
      node,
      nodesVisited,
      scopedObjects,
      dynamicObjects,
      urlParam,
      contextId
    } = this.state;

    const {
      history,
      authActions,
    } = this.props;

    if (isMounted) {

      const linkHandler = this.onNavigateToNode;
      const onUpdateDynamicObjects = this.onUpdateDynamicObjects;
      const theme = this.lookupTheme();
      const haveTheme = (theme != null);

      document.title = node.title;
      this.setPageTitle(map.name, node.title);

      let header = (
        <div id="olabHeader">
          {(haveTheme) && (
            <JsxParser
              autoCloseVoidElements
              showWarnings
              bindings={{
                props: {
                  contextId,
                  dynamicObjects,
                  history,
                  linkHandler,
                  map,
                  node,
                  nodesVisited,
                  scopedObjects,
                  urlParam,
                },
              }}
              components={{
                OlabAttendeeTag,
                OlabConstantTag,
                OlabCountersTag,
                OlabCounterTag,
                OlabLinksTag,
                OlabMediaResourceTag,
                OlabModeratorTag,
                OlabQuestionTag,
              }}
              jsx={theme?.header}
              onError={(arg) => this.onJsxParseError(arg)}
            />
          )}
        </div>
      );

      let footer = (
        <div id="olabFooter">
          {(haveTheme) && (
            <JsxParser
              autoCloseVoidElements
              showWarnings
              bindings={{
                props: {
                  contextId,
                  dynamicObjects,
                  history,
                  linkHandler,
                  map,
                  node,
                  nodesVisited,
                  scopedObjects,
                  urlParam,
                },
              }}
              components={{
                OlabAttendeeTag,
                OlabConstantTag,
                OlabCountersTag,
                OlabCounterTag,
                OlabLinksTag,
                OlabMediaResourceTag,
                OlabModeratorTag,
                OlabQuestionTag,
              }}
              jsx={theme?.footer}
              onError={(arg) => this.onJsxParseError(arg)}
            />
          )}
        </div>
      );

      let body = (
        <div id="olabNodeHtml">
          <JsxParser
            autoCloseVoidElements
            showWarnings
            bindings={{
              props: {
                authActions,
                linkHandler,
                onUpdateDynamicObjects,
                history,
                map,
                node,
                scopedObjects,
                dynamicObjects,
                urlParam,
                nodesVisited,
                contextId
              },
            }}
            components={{
              OlabAttendeeTag,
              OlabConstantTag,
              OlabCountersTag,
              OlabCounterTag,
              OlabLinksTag,
              OlabMediaResourceTag,
              OlabModeratorTag,
              OlabQuestionTag,
            }}
            jsx={node.text}
            onError={(arg) => this.onJsxParseError(arg)}
          />
        </div>
      );

      // if node is 'visit once', save it to list in storage
      if (this.state.node.visitOnce) {
        nodesVisited.push(this.state.node.id);

        // remove any duplicates.
        var newNodesVisited = [...new Set(nodesVisited)];
        this.setState({ nodesVisited: newNodesVisited });

        log.debug(`saving visited node id: ${this.state.node.id}`);
        playerState.SetNodesVisited(null, newNodesVisited);

        log.debug(`Added node id ${this.state.node.id} to visitOnce list`);
      }


      if (debug.enableWikiRendering) {
        return (
          <>
            {header}
            {body}
            {footer}
          </>
        );
      }
      else {
        return (
          <FormControl>
            {header}
            {body}
            {footer}
            <h3>Raw node</h3>
            <h4>Header</h4>
            <p>{theme?.header}</p>
            <h4>Node Text</h4>
            <p>{node.text}</p>
            <h4>Footer</h4>
            <p>{theme?.footer}</p>
          </FormControl>
        );

      }

    }
    else {

      return (
        <>
          Loading...
        </>
      );

    }

  }
}

export default withParams((withStyles(styles)(Player)));