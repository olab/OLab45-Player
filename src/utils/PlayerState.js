const persistantStorage = require("./PersistantStorage").PersistantStorage;

const KeyConstants = {
  ATRIUM: "atrium",
  CONNECTION_INFO: "connection-info",
  CONTEXT_ID: "context-id",
  DEBUG: "debug",
  DYNAMIC_OBJECTS: "dynamic-objects",
  GLOBAL: null,
  MAP_STATIC: "map-static",
  MAP: "map",
  MAPS: "maps",
  NODE_STATIC: "node-static",
  NODE: "node",
  SERVER_STATIC: "server-static",
  SERVER: "server",
  SESSION_INFO: "session-info",
  VISIT_ONCE_NODE_LIST: "visit-once-node-list",
  WATCH_PROFILE: "watchProfile",
};

class PlayerState {
  static clear(appId) {
    persistantStorage.clear(appId);
  }

  static ClearMap(appId) {
    const contextId = this.GetContextId(appId);
    const sessionInfo = this.GetSessionInfo(appId);
    const debugInfo = this.GetDebug(appId);
    // const visitOnceNodeList = this.GetNodesVisited(appId);

    persistantStorage.clear(appId);

    this.SetContextId(appId, contextId);
    this.SetSessionInfo(appId, sessionInfo);
    this.SetDebug(appId, debugInfo);
    // this.SetNodesVisited(appId, visitOnceNodeList);
  }

  // Get all settings as object
  static Get(appId) {
    const debug = this.GetDebug(appId);
    const contextId = this.GetContextId(appId);
    const dynamicObjects = this.GetDynamicObjects(appId);
    const map = this.GetMap(appId);
    const mapStatic = this.GetMapStatic(appId);
    const node = this.GetNode(appId);
    const nodeStatic = this.GetNodeStatic(appId);
    const server = persistantStorage.get(appId, KeyConstants.SERVER);
    const serverStatic = this.GetServerStatic(appId);
    const sessionInfo = this.GetSessionInfo(appId);
    const visitOnceList = this.GetNodesVisited(appId);

    return {
      debug: debug,
      contextId: contextId,
      dynamicObjects: dynamicObjects,
      map: map,
      mapId: map ? map.id : null,
      node: node,
      nodeId: node ? node.id : null,
      server: server,
      scopedObjects: {
        map: mapStatic,
        node: nodeStatic,
        server: serverStatic,
      },
      nodesVisited: visitOnceList,
      sessionInfo: sessionInfo,
    };
  }

  static SetDebug(appId, obj) {
    persistantStorage.save(appId, KeyConstants.DEBUG, obj);
  }

  static GetDebug(
    appId,
    defaultValue = { disableWikiRendering: false, disableCache: false }
  ) {
    return persistantStorage.get(appId, KeyConstants.DEBUG, defaultValue);
  }

  static GetWatchProfile(
    appId,
    defaultValue = { autoAssign: false, watchedLearners: [] }
  ) {
    return persistantStorage.get(
      appId,
      KeyConstants.WATCH_PROFILE,
      defaultValue
    );
  }

  static SetWatchProfile(appId, obj) {
    persistantStorage.save(appId, KeyConstants.WATCH_PROFILE, obj);
  }

  static GetAtrium(appId, defaultValue = {}) {
    return persistantStorage.get(appId, KeyConstants.ATRIUM, defaultValue);
  }

  static SetAtrium(appId, obj) {
    persistantStorage.save(appId, KeyConstants.ATRIUM, obj);
  }

  static SetConnectionInfo(appId, obj) {
    persistantStorage.save(appId, KeyConstants.CONNECTION_INFO, obj);
  }

  static GetConnectionInfo(
    appId,
    defaultValue = { authInfo: { expires: 0, token: null } }
  ) {
    return persistantStorage.get(
      appId,
      KeyConstants.CONNECTION_INFO,
      defaultValue
    );
  }

  static SetSessionInfo(appId, obj) {
    persistantStorage.save(appId, KeyConstants.SESSION_INFO, obj);
  }

  static GetSessionInfo(appId, defaultValue = { authInfo: { expires: 0 } }) {
    return persistantStorage.get(
      appId,
      KeyConstants.SESSION_INFO,
      defaultValue
    );
  }

  static SetContextId(appId, obj) {
    persistantStorage.save(appId, KeyConstants.CONTEXT_ID, obj);
  }

  static GetContextId(appId, defaultValue = null) {
    return persistantStorage.get(appId, KeyConstants.CONTEXT_ID, defaultValue);
  }

  static SetMaps(appId, obj) {
    persistantStorage.save(appId, KeyConstants.MAPS, obj);
  }

  static GetMaps(appId, defaultValue = []) {
    return persistantStorage.get(appId, KeyConstants.MAPS, defaultValue);
  }

  static SetMap(appId, obj) {
    persistantStorage.save(appId, KeyConstants.MAP, obj);
  }

  static GetMap(appId, defaultValue = null) {
    return persistantStorage.get(appId, KeyConstants.MAP, defaultValue);
  }

  static SetMapStatic(appId, obj) {
    persistantStorage.save(appId, KeyConstants.MAP_STATIC, obj);
  }

  static GetMapStatic(appId, defaultValue = null) {
    return persistantStorage.get(appId, KeyConstants.MAP_STATIC, defaultValue);
  }

  static SetNode(appId, obj) {
    persistantStorage.save(appId, KeyConstants.NODE, obj);
  }

  static GetNode(appId, defaultValue = null) {
    return persistantStorage.get(appId, KeyConstants.NODE, defaultValue);
  }

  static SetNodeStatic(appId, obj) {
    persistantStorage.save(appId, KeyConstants.NODE_STATIC, obj);
  }

  static GetNodeStatic(appId, defaultValue = null) {
    return persistantStorage.get(appId, KeyConstants.NODE_STATIC, defaultValue);
  }

  static SetServerStatic(appId, obj) {
    persistantStorage.save(appId, KeyConstants.SERVER_STATIC, obj);
  }

  static GetServerStatic(appId, defaultValue = null) {
    return persistantStorage.get(
      appId,
      KeyConstants.SERVER_STATIC,
      defaultValue
    );
  }

  static SetDynamicObjects(appId, obj) {
    persistantStorage.save(appId, KeyConstants.DYNAMIC_OBJECTS, obj);
  }

  static GetDynamicObjects(appId, defaultValue = null) {
    return persistantStorage.get(
      appId,
      KeyConstants.DYNAMIC_OBJECTS,
      defaultValue
    );
  }

  static SetNodesVisited(appId, obj) {
    persistantStorage.save(appId, KeyConstants.VISIT_ONCE_NODE_LIST, obj);
  }

  static GetNodesVisited(appId, defaultValue = []) {
    return persistantStorage.get(
      appId,
      KeyConstants.VISIT_ONCE_NODE_LIST,
      defaultValue
    );
  }
}

export { PlayerState };
