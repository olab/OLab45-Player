import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
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
import OlabAttendeeTag from '../WikiTags/Turkee/Turkee';
import OlabModeratorTag from '../WikiTags/Turker/Turker';

import styles from './styles';
import {
  getMap,
  getMapScopedObjects,
  getMapNode,
  getNodeScopedObjects,
  getServerScopedObjects,
  getDynamicScopedObjects
} from '../../services/api'
const persistantStorage = require('../../utils/StateStorage').PersistantStateStorage;

class Player extends PureComponent {

  constructor(props) {
    super(props);

    log.enableAll();

    const { params: { mapId, nodeId, param } } = this.props.match;
    log.info(`playing map ${mapId}, node ${nodeId}, param ${param}`);

    this.state = {
      scopedObjects: {
        map: null,
        node: null,
        server: null
      },
      disableCache: false,
      enableWikiTranslation: true,
      isDynamicFetched: false,
      isMapFetched: false,
      isNodeFetched: false,
      isScopedObjectsFetched: false,
      isServerFetched: false,
      map: null,
      mapId: Number(mapId),
      node: null,
      nodesVisited: [],
      nodeId: Number(nodeId),
      urlParam: param,
      sessionId: null,
      signalRConnection: null
    };

    this.state.enableWikiTranslation = !persistantStorage.get('dbg-disableWikiRendering');
    this.state.disableCache = persistantStorage.get('dbg-disableDataCaching');

    if (!this.state.disableCache) {

      this.state.map = persistantStorage.get('map');
      this.state.node = persistantStorage.get('node');

      this.state.scopedObjects.server = persistantStorage.get('server-so');
      this.state.scopedObjects.map = persistantStorage.get('map-so');
      this.state.scopedObjects.node = persistantStorage.get('node-so');
      this.state.nodesVisited = persistantStorage.get('visit-once-nodes');
    }
    else {
      log.info(`disabled cache`);
    }

    // eslint-disable-next-line
    window.addEventListener('popstate', function (event) {
      // eslint-disable-next-line
      history.pushState(null, document.title, location.href);
      alert('Back button disabled during map play.');
    });

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

      if (this.state.disableCache) {
        persistantStorage.save('server-so', {});
      }

      if (server && !disableCache) {
        this.setState({ isServerFetched: true });
        log.debug('using cached server data');
        return;
      }

      this.setState({ isServerFetched: false });

      const { data: scopedObjectsData } = await getServerScopedObjects(props, id);
      const { scopedObjects } = this.state;

      this.setState({
        isServerFetched: true,
        scopedObjects: {
          map: scopedObjects.map,
          node: scopedObjects.node,
          server: scopedObjectsData
        }
      });

      if (!this.state.disableCache) {
        persistantStorage.save('server-so', this.state.scopedObjects.server);
      }

      log.debug('read server data');

    } catch (error) {
      log.error(error);
    }
  }

  getMap = async (props, id) => {

    try {

      // test if already have map loaded (and it's the same one)
      var { map, disableCache } = this.state;

      if (this.state.disableCache) {
        persistantStorage.save('map-so', {});
        persistantStorage.save('map', {});
      }

      if (map && !disableCache) {

        if (Number(id) === map.id) {
          this.setState({ isMapFetched: true });
          log.debug('using cached map data');
          return;
        }

      }

      this.setState({ isMapFetched: false });

      const { data: objData } = await getMap(props, id);
      const { data: scopedObjectsData } = await getMapScopedObjects(props, id);
      const { scopedObjects } = this.state;

      this.setState({
        isMapFetched: true,
        map: objData,
        scopedObjects: {
          map: scopedObjectsData,
          node: scopedObjects.node,
          server: scopedObjects.server
        }
      });

      if (!this.state.disableCache) {
        persistantStorage.save('map-so', this.state.scopedObjects.map);
        persistantStorage.save('map', this.state.map);
      }

      log.debug('read map data');

    } catch (error) {
      log.error(error);
    }

  }

  getNode = async (props, mapId, nodeId) => {

    try {

      if (this.state.disableCache) {
        persistantStorage.save('node', {});
        persistantStorage.save('node-so', {});
      }
      else {
        // reset nodes visited if entering map via 'root node'
        if (nodeId === 0) {
          persistantStorage.save('visit-once-nodes', []);
          this.setState({ nodesVisited: [] });
        }
      }

      // test if already have node loaded (and it's the same one)
      var { node, disableCache } = this.state;
      if (node && !disableCache) {
        if (Number(nodeId) === node.id) {
          this.setState({ isNodeFetched: true });
          log.debug('using cached node data');
          return;
        }
      }

      this.setState({ isNodeFetched: false });

      const { data: objData } = await getMapNode(props, mapId, nodeId);
      const { data: scopedObjectsData } = await getNodeScopedObjects(props, objData.id);
      const { scopedObjects } = this.state;

      this.setState({
        isNodeFetched: true,
        node: objData,
        sessionId: objData.sessionId,
        scopedObjects: {
          map: scopedObjects.map,
          node: scopedObjectsData,
          server: scopedObjects.server
        }
      });

      if (!this.state.disableCache) {
        persistantStorage.save('node', this.state.node);
        persistantStorage.save('node-so', this.state.scopedObjects.node);
      }

      if ( nodeId === 0 ) {
        persistantStorage.save('sessionId', objData.sessionId);
      }

      log.debug('read node data');

    } catch (error) {
      log.error(error);
    }

  }

  setCounterChange = ( state ) => {
    alert( state );
  }

  getDynamic = async (props, state) => {

    try {

      this.setState({ isDynamicFetched: false });
      const { data: scopedObjectsData } = await getDynamicScopedObjects(props, state.mapId, state.nodeId);

      this.setState({
        isDynamicFetched: true,
        dynamicObjects: scopedObjectsData
      });

      persistantStorage.save('dynamic-so', this.state.dynamicObjects);

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

  async componentDidMount() {
    await this.getServer(this.props, 1);
    await this.getMap(this.props, this.state.mapId);
    await this.getNode(this.props, this.state.mapId, this.state.nodeId);
    await this.getDynamic(this.props, this.state);
  }

  onUpdateDynamicObjects = (dynamicObjects) => {
    this.setState({ dynamicObjects: dynamicObjects });
    persistantStorage.save('dynamic-so', this.state.dynamicObjects);
  }

  onJsxParseError(arg) {
    const t = arg;
    log.error(t);
    alert(`Renderer error: ${t}`);
  }

  render() {

    const {
      isMapFetched,
      isNodeFetched,
      isServerFetched,
      isDynamicFetched,
      map,
      node,
      nodesVisited,
      scopedObjects,
      dynamicObjects,
      urlParam,
      sessionId
    } = this.state;

    const {
      history,
      authActions,
    } = this.props;

    if (isServerFetched && isMapFetched && isNodeFetched && isDynamicFetched) {

      const linkHandler = this.onNavigateToNode;
      const theme = this.lookupTheme();
      const haveTheme = (theme != null);
      const onUpdateDynamicObjects = this.onUpdateDynamicObjects.bind(this);

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
                  linkHandler,
                  history,
                  map,
                  node,
                  scopedObjects,
                  urlParam,
                  nodesVisited,
                  sessionId
                },
              }}
              components={{ OlabConstantTag, OlabQuestionTag, OlabLinksTag, OlabCountersTag, OlabCounterTag, OlabMediaResourceTag, OlabAttendeeTag, OlabModeratorTag }}
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
                  linkHandler,
                  history,
                  map,
                  node,
                  scopedObjects,
                  dynamicObjects,
                  urlParam,
                  nodesVisited,
                  sessionId
                },
              }}
              components={{ OlabConstantTag, OlabQuestionTag, OlabLinksTag, OlabCountersTag, OlabCounterTag, OlabMediaResourceTag, OlabAttendeeTag, OlabModeratorTag }}
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
                sessionId
              },
            }}
            components={{ OlabConstantTag, OlabQuestionTag, OlabLinksTag, OlabCountersTag, OlabCounterTag, OlabMediaResourceTag, OlabAttendeeTag, OlabModeratorTag }}
            jsx={node.text}
            onError={(arg) => this.onJsxParseError(arg)}
          />
        </div>
      );

      // if node is 'visit once', save it to list in storage
      if (this.state.node.visitOnce) {
        nodesVisited.push(this.state.node.id);

        // remove any duplicates.
        var newNodesVisited = [ ...new Set(nodesVisited) ];        
        this.setState({ nodesVisited: newNodesVisited });
        
        log.debug(`saving visited node id: ${this.state.node.id}`);
        persistantStorage.save('visit-once-nodes', newNodesVisited);

        log.debug(`Added node id ${this.state.node.id} to visitOnce list`);
      }


      if (!persistantStorage.get('dbg-disableWikiRendering')) {
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

// export default withStyles(styles)(Player);
export default withRouter((withStyles(styles)(Player)))