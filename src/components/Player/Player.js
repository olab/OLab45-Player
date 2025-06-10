import React, { PureComponent } from "react";
import { withStyles } from "@material-ui/core/styles";
import { FormControl } from "@material-ui/core";
import JsxParser from "react-jsx-parser";
import log from "loglevel";
const playerState = require("../../utils/PlayerState").PlayerState;
import { DynamicObject } from "../../utils/DynamicObject";
import { ScopedObject } from "../../utils/ScopedObject";

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
  // translateLevelToObject,
  // translateTypeToObject,
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
      scopedObject: new ScopedObject(),
      errorFound: false,
      errorMessage: null,
      isMounted: false,
      mapId: this.props.params.mapId,
      nodeId: this.props.params.nodeId,
      disableCache: persistedState.debug.disableCache,
      loadProgress: null,
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
    try {
      const { serverScopedObjects } = await this.getServer(this.props, 1);
      this.setState({ loadProgress: "server" });

      const { map, mapScopedObjects } = await this.getMap(this.props);
      this.setState({ loadProgress: `map '${map.name}'` });

      const { node, nodeScopedObjects } = await this.getNode(this.props);

      var originalDynamicObjects = playerState.GetDynamicObjects();
      if (originalDynamicObjects == null) {
        originalDynamicObjects = node.dynamicObjects;
      }

      let dynamicObject = new DynamicObject(originalDynamicObjects);
      let scopedObject = new ScopedObject({
        map: mapScopedObjects,
        node: nodeScopedObjects,
        server: serverScopedObjects,
      });

      this.setState({
        isMounted: true,
        mapId: map.id,
        nodeId: node.id,
        node: node,
        map: map,
        contextId: node.contextId,
        scopedObject: scopedObject,
        dynamicObject: dynamicObject,
      });
    } catch (error) {
      this.showError(error.message);
    }
  }

  lookupTheme = () => {
    let theme = null;

    try {
      const { scopedObject } = this.state;

      const map = scopedObject.getMap();
      const server = scopedObject.getServer();

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
    try {
      // test if already have server scoped objects loaded
      var {
        scopedObject, //s: { server: serverScopedObjects },
        disableCache,
      } = this.state;

      let serverScopedObjects = scopedObject.getServer();

      if (!serverScopedObjects || disableCache) {
        log.debug("loading server scoped objects");
        const { data: scopedObjectsData } = await getServerScopedObjects(
          props,
          id
        );
        serverScopedObjects = scopedObjectsData;
        scopedObject.setServerObjects(serverScopedObjects);
        // playerState.SetServerStatic(serverScopedObjects);
      } else {
        log.debug("using cached server scoped objects");
      }

      return { serverScopedObjects };
    } catch (error) {
      this.showError(error.message);
    }
  };

  getMap = async (props) => {
    try {
      const mapId = props.params.mapId;

      // test if already have map scoped objects loaded
      var {
        map,
        scopedObject, // s: { map: mapScopedObjects },
        disableCache,
      } = this.state;

      if (!map || disableCache) {
        log.debug("loading map");
        const { data: objData } = await getMap(props, mapId);
        map = objData;
        playerState.SetMap(map);
      } else {
        log.debug("using cached map data");
      }

      let mapScopedObjects = scopedObject.getMap();

      if (!mapScopedObjects || disableCache) {
        log.debug("loading map scoped objects");
        const { data: objData } = await getMapScopedObjects(props, mapId);
        mapScopedObjects = objData;
        scopedObject.setMapObjects(mapScopedObjects);
        // playerState.SetMapStatic(mapScopedObjects);
      } else {
        log.debug("using cached map scoped objects");
      }

      return { map, mapScopedObjects };
    } catch (error) {
      this.showError(error.message);
    }
  };

  getNode = async (props) => {
    try {
      const mapId = props.params.mapId;
      let nodeId = props.params.nodeId;

      // test if already have node scoped objects loaded
      var {
        node,
        scopedObject, // s: { node: nodeScopedObjects },
        disableCache,
        dynamicObject,
      } = this.state;

      // do a check if the first node played, based
      // on if there was a previous node in local storage
      const newPlay = nodeId == 0;
      dynamicObject.newPlay = newPlay;

      if (!node || disableCache) {
        log.debug("loading node");
        const { data: objData } = await getMapNode(
          props,
          mapId,
          nodeId,
          dynamicObject
        );
        node = objData;
        playerState.SetNode(node);
      } else {
        log.debug("using cached node data");
      }

      nodeId = node.id;

      // if new play, should be new contextId from server,
      // otherwise get it out of local state
      if (newPlay) {
        playerState.SetContextId(node.contextId);
      } else {
        node.contextId = playerState.GetContextId();
      }

      let nodeScopedObjects = scopedObject.getNode();

      if (!nodeScopedObjects || disableCache) {
        log.debug("loading node scoped objects");
        const { data: objData } = await getNodeScopedObjects(props, nodeId);
        nodeScopedObjects = objData;
        scopedObject.setNodeObjects(nodeScopedObjects);
        // playerState.SetNodeStatic(nodeScopedObjects);
      } else {
        log.debug("using cached node scoped objects");
      }

      return { node, nodeScopedObjects };
    } catch (error) {
      this.showError(error.message);
    }
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

    playerState.SetNode(newState.node);
    this.setState(newState);
  }

  onUpdateScopedObjects(newObject) {
    const { scopedObject } = this.state;

    scopedObject.updateScopedObject(newObject);

    const newState = {
      ...this.state,
      scopedObject: new ScopedObject(scopedObject.clone()),
    };

    this.setState(newState);
  }

  onUpdateDynamicObjects = (dynamicObjects) => {
    let newState = {
      ...this.state,
      dynamicObject: new DynamicObject(dynamicObjects),
    };
    this.setState(newState);
    playerState.SetDynamicObjects(dynamicObjects);
  };

  // getScopedObjectsForType(newObject) {

  //   const {
  //     scopedObject
  //   } = this.state;

  //   let objectType = translateTypeToObject(newObject.type);
  //   let scopeLevel = translateLevelToObject(newObject.scopeLevel);

  //   let items = [...this.state.scopedObjects[scopeLevel][objectType]];
  //   return { items, objectType, scopeLevel };
  // }

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
      scopedObject,
      dynamicObject,
      urlParam,
      contextId,
      errorFound,
      errorMessage,
      loadProgress,
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
                  scopedObject,
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
                  scopedObject,
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
                scopedObject,
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
      return <center>Loading {loadProgress}...</center>;
    }
  }
}

export default withParams(withStyles(styles)(Player));
