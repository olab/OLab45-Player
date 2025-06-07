import React, { PureComponent } from "react";
import { withStyles } from "@material-ui/core/styles";
import { FormControl } from "@material-ui/core";
import JsxParser from "react-jsx-parser";
import log from "loglevel";
const playerState = require("../../utils/PlayerState").PlayerState;
import { DynamicObject } from "../../utils/DynamicObject";

import ErrorPopup from "../ErrorPopup/ErrorPopup";
import {
  OlabConstantTag,
  OlabCountersTag,
  OlabCounterTag,
  OlabSessionTag,
  OlabLinksTag,
  OlabReportTag,
  OlabMediaResourceTag,
  OlabScriptTag,
  OlabQuestionTag,
  OlabDragAndDropQuestion,
  OlabDropDownQuestion,
  OlabMultilineTextQuestion,
  OlabMultiPickQuestion,
  OlabSinglelineTextQuestion,
  OlabSinglePickQuestion,
  OlabSliderQuestion,
  OlabAttendeeTag,
  OlabModeratorTag,
  translateLevelToObject,
  translateTypeToObject,
} from "../WikiTags/WikiUtils";

import { withParams } from "../ComponentWrapper";
import { config } from "../../config";

import styles from "./styles";
import {
  getMap,
  getMapScopedObjects,
  getMapNode,
  getNodeScopedObjects,
  getServerScopedObjects,
  getDynamicScopedObjects,
} from "../../services/api";

class Player extends PureComponent {
  constructor(props) {
    super(props);

    const { mapId, nodeId } = arguments[0].params;
    log.info(`playing map ${mapId}, node ${nodeId}`);

    this.state = {
      isMounted: false,
      signalRConnection: null,
    };

    this.getServer = this.getServer.bind(this);
    this.getMap = this.getMap.bind(this);
    this.getNode = this.getNode.bind(this);
    this.showError = this.showError.bind(this);
    this.onErrorDismissed = this.onErrorDismissed.bind(this);

    this.onUpdateDynamicObjects = this.onUpdateDynamicObjects.bind(this);
    this.onUpdateObjects = this.onUpdateObjects.bind(this);
    this.onUpdateScopedObjects = this.onUpdateScopedObjects.bind(this);
    this.searchCollection = this.searchCollection.bind(this);

    const persistedState = playerState.Get();

    this.state = {
      ...this.state,
      ...persistedState,
      dynamicObject: new DynamicObject(),
      errorFound: false,
      errorMessage: null,
    };

    // eslint-disable-next-line
    window.addEventListener("popstate", function (event) {
      // eslint-disable-next-line
      history.pushState(null, document.title, location.href);
      alert("Back button disabled during case play.");
    });
  }

  showError = (message) => {
    this.setState({
      errorFound: true,
      errorMessage: message,
    });
  };

  async componentDidMount() {
    this.setState({ mapId: this.props.params.mapId });
    this.setState({ nodeId: this.props.params.nodeId });

    try {
      await this.getServer(this.props, 1);
      await this.getMap(this.props);
      await this.getNode(this.props);

      this.setState({ isMounted: true });
    } catch (error) {
      this.showError(error.message);
    }
  }

  lookupTheme = () => {
    let theme = null;

    try {
      const {
        scopedObjects: { map, server },
      } = this.state;

      if (server != null && server.themes != null) {
        if (server.themes.length > 0) {
          theme = server.themes[0];
        }
      }

      if (map != null && map.themes != null) {
        if (map.themes.length > 0) {
          theme = map.themes[0];
        }
      }
    } catch (error) {
      log.error(error);
    }

    if (theme) {
      log.debug(
        `found theme: '${theme.name}' (${theme.id}). parent: '${theme.imagetype}' (${theme.parentId})`
      );
    }
    return theme;
  };

  getServer = async (props, id) => {
    // test if already have server loaded
    var {
      scopedObjects: { server },
      disableCache,
    } = this.state;

    if (server && !disableCache) {
      this.setState({ isServerFetched: true });
      log.debug("using cached server data");
      return;
    }

    const { data: scopedObjectsData } = await getServerScopedObjects(props, id);

    const { scopedObjects } = this.state;

    this.setState({
      scopedObjects: {
        map: scopedObjects.map,
        node: scopedObjects.node,
        server: scopedObjectsData,
      },
    });

    if (!this.state.disableCache) {
      playerState.SetServerStatic(this.state.scopedObjects.server);
    }

    log.debug("read server data");
  };

  getMap = async (props) => {
    // test if already have map loaded (and it's the same one)
    var { map, disableCache } = this.state;
    let { mapId: id } = this.state;

    if (map && !disableCache) {
      if (Number(id) === map.id) {
        this.setState({ isMapFetched: true });
        log.debug("using cached map data");
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
        server: scopedObjects.server,
      },
    });

    if (!this.state.disableCache) {
      playerState.SetMapStatic(this.state.scopedObjects.map);
      playerState.SetMap(this.state.map);
    }

    log.debug("read map data");
  };

  getNode = async (props) => {
    let { mapId, nodeId, dynamicObject, node, disableCache } = this.state;

    // reset nodes visited if entering map via 'root node'
    if (nodeId == 0) {
      this.setState({ nodesVisited: [] });
      playerState.SetNodesVisited([]);
    }

    // test if already have node loaded (and it's the same one)
    if (node && !disableCache) {
      if (Number(nodeId) === node.id) {
        log.debug("using cached node data");
        return;
      }
    }

    // do a check if the first node played, based
    // on if there was a previous node in local storage
    const newPlay = nodeId == 0;
    dynamicObject.newPlay = newPlay;

    const { data: nodeData } = await getMapNode(
      props,
      mapId,
      nodeId,
      dynamicObject
    );

    const { data: scopedObjectsData } = await getNodeScopedObjects(
      props,
      nodeData.id
    );

    const { scopedObjects } = this.state;

    // extract and delete the all-scope dynamic objects that
    // piggy-back on the node object
    let newDynamicObject = new DynamicObject(nodeData.dynamicObjects);
    delete nodeData.dynamicObjects;

    // if new play, should be new contextId from server,
    // otherwise get it out of local state
    if (newPlay) {
      playerState.SetContextId(nodeData.contextId);
    } else {
      nodeData.contextId = playerState.GetContextId();
    }

    log.info(`contextId: ${nodeData.contextId}`);

    this.setState({
      contextId: nodeData.contextId,
      node: nodeData,
      dynamicObject: newDynamicObject,
      scopedObjects: {
        map: scopedObjects.map,
        node: scopedObjectsData,
        server: scopedObjects.server,
      },
    });

    if (!this.state.disableCache) {
      playerState.SetNode(this.state.node);
      playerState.SetDynamicObjects(newDynamicObject);
      playerState.SetNodeStatic(this.state.scopedObjects.node);
    }

    log.debug("read node data");
  };

  setCounterChange = (state) => {
    alert(state);
  };

  getDynamic = async (props, state) => {
    try {
      this.setState({ isDynamicFetched: false });
      const { data: scopedObjectsData } = await getDynamicScopedObjects(
        props,
        state.mapId,
        state.nodeId
      );

      var dynamicObject = new DynamicObject(scopedObjectsData);
      this.setState({
        dynamicObject: dynamicObject,
      });

      playerState.SetDynamicObjects(dynamicObject.data);

      log.debug("read dynamic data");
    } catch (error) {
      log.error(error);
    }
  };

  setPageTitle = (mapTitle, nodeTitle) => {
    document.title = `${mapTitle} | ${nodeTitle}`;
  };

  onNavigateToNode = (mapId, nodeId, urlParam) => {
    let url = `${config.APP_BASEPATH}/${mapId}/${nodeId}`;
    if (urlParam) {
      url += `/${urlParam}`;
    }

    log.debug(`navigating to ${url}`);
    window.location.href = url;
  };

  searchCollection(array, elementId) {
    if (!Array.isArray(array)) {
      return null;
    }
    for (const obj of array) {
      if (obj.htmlIdBase === elementId) {
        log.debug(`found '${elementId}'`);
        return { ...obj };
      }
    }
    return null;
  }

  onUpdateObjects(newObject) {
    let obj = null;

    if (newObject.type === "link") {
      if (this.state.node.links) {
        obj = this.searchCollection(
          this.state.node.links,
          newObject.htmlIdBase
        );
      }
    }

    if (obj == null) {
      log.error(`could not find ${newObject.type} object`);
      return;
    }

    let items = this.state.node.links;
    for (let index = 0; index < items.length; index++) {
      // 2. Make a shallow copy of the item to mutate
      let item = { ...items[index] };

      if (item.id === newObject.id) {
        log.debug(`${item.type} object '${item.name}': changed}`);
        items[index] = newObject;
        break;
      }
    }

    const newState = {
      ...this.state,
      node: {
        ...this.state.node,
      },
    };

    this.setState(newState);
  }

  onUpdateScopedObjects(newObject) {
    // 1. Make a shallow copy of the items
    let { items, objectType, scopeLevel } =
      this.getScopedObjectsForType(newObject);

    for (let index = 0; index < items.length; index++) {
      // 2. Make a shallow copy of the item to mutate
      let item = { ...items[index] };

      if (item.id === newObject.id) {
        log.debug(`${item.type} object '${item.name}': changed}`);
        items[index] = newObject;
        break;
      }
    }

    const newState = {
      ...this.state,
      scopedObjects: {
        ...this.state.scopedObjects, // Copy other fields
      },
    };

    newState.scopedObjects[scopeLevel][objectType] = items;

    this.setState(newState);
  }

  onUpdateDynamicObjects = (dynamicObject) => {
    this.setState({
      ...this.state,
      dynamicObject: dynamicObject,
    });
    playerState.SetDynamicObjects(dynamicObject);
  };

  getScopedObjectsForType(newObject) {
    let objectType = translateTypeToObject(newObject.type);
    let scopeLevel = translateLevelToObject(newObject.scopeLevel);

    let items = [...this.state.scopedObjects[scopeLevel][objectType]];
    return { items, objectType, scopeLevel };
  }

  onJsxParseError(arg) {
    const t = arg;
    log.error(t);
    alert(`Renderer error: ${t}`);
  }

  onErrorDismissed() {
    log.debug(`navigating to /player`);
    window.location.href = "/player";
  }

  render() {
    const {
      debug,
      isMounted,
      map,
      node,
      nodesVisited,
      scopedObjects,
      dynamicObject,
      urlParam,
      contextId,
      errorFound,
      errorMessage,
    } = this.state;

    const { history, authActions } = this.props;
    let player = this;

    // paint an error box
    if (errorFound) {
      return (
        <ErrorPopup
          props={{
            // onErrorDismissed: this.onErrorDismissed,
            openErrorBox: errorFound,
            errorMessage: errorMessage,
          }}
        />
      );
    }

    if (isMounted) {
      const onNavigateToNode = this.onNavigateToNode;
      const onUpdateDynamicObjects = this.onUpdateDynamicObjects;
      const onUpdateScopedObjects = this.onUpdateScopedObjects;
      const onUpdateObjects = this.onUpdateObjects;
      const theme = this.lookupTheme();
      const haveTheme = theme != null;

      document.title = node.title;
      this.setPageTitle(map.name, node.title);

      const header = (
        <div id="olabHeader">
          {haveTheme && (
            <JsxParser
              autoCloseVoidElements
              showWarnings
              bindings={{
                props: {
                  contextId,
                  dynamicObject,
                  history,
                  map,
                  node,
                  nodesVisited,
                  scopedObjects,
                  urlParam,
                  onNavigateToNode,
                },
              }}
              components={{
                OlabConstantTag,
                OlabCountersTag,
                OlabCounterTag,
                OlabSessionTag,
                OlabLinksTag,
                OlabMediaResourceTag,
                OlabReportTag,
                OlabQuestionTag,
                OlabDragAndDropQuestion,
                OlabDropDownQuestion,
                OlabMultilineTextQuestion,
                OlabMultiPickQuestion,
                OlabSinglelineTextQuestion,
                OlabSinglePickQuestion,
                OlabSliderQuestion,
                OlabScriptTag,
              }}
              jsx={theme?.header}
              onError={(arg) => this.onJsxParseError(arg)}
            />
          )}
        </div>
      );

      const footer = (
        <div id="olabFooter">
          {haveTheme && (
            <JsxParser
              autoCloseVoidElements
              showWarnings
              bindings={{
                props: {
                  contextId,
                  dynamicObject,
                  history,
                  map,
                  node,
                  nodesVisited,
                  scopedObjects,
                  urlParam,
                  onNavigateToNode,
                },
              }}
              components={{
                OlabConstantTag,
                OlabCountersTag,
                OlabCounterTag,
                OlabSessionTag,
                OlabLinksTag,
                OlabMediaResourceTag,
                OlabReportTag,
                OlabQuestionTag,
                OlabDragAndDropQuestion,
                OlabDropDownQuestion,
                OlabMultilineTextQuestion,
                OlabMultiPickQuestion,
                OlabSinglelineTextQuestion,
                OlabSinglePickQuestion,
                OlabSliderQuestion,
                OlabScriptTag,
              }}
              jsx={theme?.footer}
              onError={(arg) => this.onJsxParseError(arg)}
            />
          )}
        </div>
      );

      const body = (
        <div id="olabNodeHtml">
          <JsxParser
            autoCloseVoidElements
            showWarnings
            bindings={{
              props: {
                authActions,
                contextId,
                dynamicObject,
                history,
                map,
                node,
                nodesVisited,
                onUpdateDynamicObjects,
                onUpdateScopedObjects,
                onUpdateObjects,
                player,
                scopedObjects,
                urlParam,
                onNavigateToNode,
              },
            }}
            components={{
              OlabAttendeeTag,
              OlabConstantTag,
              OlabCountersTag,
              OlabCounterTag,
              OlabSessionTag,
              OlabLinksTag,
              OlabMediaResourceTag,
              OlabModeratorTag,
              OlabReportTag,
              OlabQuestionTag,
              OlabDragAndDropQuestion,
              OlabDropDownQuestion,
              OlabMultilineTextQuestion,
              OlabMultiPickQuestion,
              OlabSinglelineTextQuestion,
              OlabSinglePickQuestion,
              OlabSliderQuestion,
              OlabScriptTag,
            }}
            jsx={node.text}
            onError={(arg) => this.onJsxParseError(arg)}
          />
        </div>
      );

      if (debug.disableWikiRendering) {
        return (
          <FormControl>
            {header}
            {body}
            {footer}
            <h3>Raw node</h3>
            <h4>Header</h4>
            <div>{theme?.header}</div>
            <h4>Node Text</h4>
            <div>{node.text}</div>
            <h4>Footer</h4>
            <div>{theme?.footer}</div>
          </FormControl>
        );
      } else {
        return (
          <>
            {header}
            {body}
            {footer}
          </>
        );
      }
    } else {
      return <>Loading...</>;
    }
  }
}

export default withParams(withStyles(styles)(Player));
