import { config } from "../config";

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
  static appId = config.APPLICATION_ID;
  static userId = "";
  static storageKey = this.appId;

  static SetUser(userId) {
    if (userId == null) {
      return;
    }
    this.userId = userId;
    this.storageKey = `${this.appId}.${this.userId}.`;
  }

  static clear() {
    persistantStorage.clear(this.storageKey);
  }

  static ClearMap() {
    const contextId = this.GetContextId();
    const sessionInfo = this.GetSessionInfo();
    const debugInfo = this.GetDebug();

    persistantStorage.clear(this.storageKey);

    this.SetContextId(contextId);
    this.SetSessionInfo(sessionInfo);
    this.SetDebug(debugInfo);
  }

  // Get all settings as object
  static Get() {
    const debug = this.GetDebug();
    const contextId = this.GetContextId();
    const dynamicObjects = this.GetDynamicObjects();
    const map = this.GetMap();
    const mapStatic = this.GetMapStatic();
    const node = this.GetNode();
    const nodeStatic = this.GetNodeStatic();
    const server = persistantStorage.get(KeyConstants.SERVER);
    const serverStatic = this.GetServerStatic();
    const sessionInfo = this.GetSessionInfo();
    const visitOnceList = this.GetNodesVisited();

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

  static SetDebug(obj) {
    persistantStorage.save(this.storageKey, KeyConstants.DEBUG, obj);
  }

  static GetDebug(
    userId = null,
    defaultValue = { disableWikiRendering: false, disableCache: false }
  ) {
    return persistantStorage.get(
      this.storageKey,
      KeyConstants.DEBUG,
      defaultValue
    );
  }

  static GetWatchProfile(
    storageKey,
    defaultValue = { autoAssign: false, watchedLearners: [] }
  ) {
    return persistantStorage.get(
      storageKey,
      KeyConstants.WATCH_PROFILE,
      defaultValue
    );
  }

  static SetWatchProfile(storageKey, obj) {
    persistantStorage.save(storageKey, KeyConstants.WATCH_PROFILE, obj);
  }

  static GetAtrium(defaultValue = { roomName: "" }) {
    return persistantStorage.get(
      this.storageKey,
      KeyConstants.ATRIUM,
      defaultValue
    );
  }

  static SetAtrium(obj = { roomName: "" }) {
    persistantStorage.save(this.storageKey, KeyConstants.ATRIUM, obj);
  }

  static SetConnectionInfo(obj) {
    persistantStorage.save(this.storageKey, KeyConstants.CONNECTION_INFO, obj);
  }

  static GetConnectionInfo(
    defaultValue = { authInfo: { expires: 0, token: null } }
  ) {
    return persistantStorage.get(
      this.storageKey,
      KeyConstants.CONNECTION_INFO,
      defaultValue
    );
  }

  static SetSessionInfo(obj) {
    persistantStorage.save(this.storageKey, KeyConstants.SESSION_INFO, obj);
  }

  static GetSessionInfo(defaultValue = { authInfo: { expires: 0 } }) {
    return persistantStorage.get(
      this.storageKey,
      KeyConstants.SESSION_INFO,
      defaultValue
    );
  }

  static SetContextId(obj) {
    persistantStorage.save(this.storageKey, KeyConstants.CONTEXT_ID, obj);
  }

  static GetContextId(defaultValue = null) {
    return persistantStorage.get(
      this.storageKey,
      KeyConstants.CONTEXT_ID,
      defaultValue
    );
  }

  static SetMaps(obj) {
    persistantStorage.save(this.storageKey, KeyConstants.MAPS, obj);
  }

  static GetMaps(defaultValue = []) {
    return persistantStorage.get(
      this.storageKey,
      KeyConstants.MAPS,
      defaultValue
    );
  }

  static SetMap(obj) {
    persistantStorage.save(this.storageKey, KeyConstants.MAP, obj);
  }

  static GetMap(defaultValue = null) {
    return persistantStorage.get(
      this.storageKey,
      KeyConstants.MAP,
      defaultValue
    );
  }

  static SetMapStatic(obj) {
    persistantStorage.save(this.storageKey, KeyConstants.MAP_STATIC, obj);
  }

  static GetMapStatic(defaultValue = null) {
    return persistantStorage.get(
      this.storageKey,
      KeyConstants.MAP_STATIC,
      defaultValue
    );
  }

  static SetNode(obj) {
    persistantStorage.save(this.storageKey, KeyConstants.NODE, obj);
  }

  static GetNode(defaultValue = null) {
    return persistantStorage.get(
      this.storageKey,
      KeyConstants.NODE,
      defaultValue
    );
  }

  static SetNodeStatic(obj) {
    persistantStorage.save(this.storageKey, KeyConstants.NODE_STATIC, obj);
  }

  static GetNodeStatic(defaultValue = null) {
    return persistantStorage.get(
      this.storageKey,
      KeyConstants.NODE_STATIC,
      defaultValue
    );
  }

  static SetServerStatic(obj) {
    persistantStorage.save(this.storageKey, KeyConstants.SERVER_STATIC, obj);
  }

  static GetServerStatic(defaultValue = null) {
    return persistantStorage.get(
      this.storageKey,
      KeyConstants.SERVER_STATIC,
      defaultValue
    );
  }

  static SetDynamicObjects(obj) {
    persistantStorage.save(this.storageKey, KeyConstants.DYNAMIC_OBJECTS, obj);
  }

  static GetDynamicObjects(defaultValue = null) {
    return persistantStorage.get(
      this.storageKey,
      KeyConstants.DYNAMIC_OBJECTS,
      defaultValue
    );
  }

  static SetNodesVisited(obj) {
    persistantStorage.save(
      this.storageKey,
      KeyConstants.VISIT_ONCE_NODE_LIST,
      obj
    );
  }

  static GetNodesVisited(defaultValue = []) {
    return persistantStorage.get(
      this.storageKey,
      KeyConstants.VISIT_ONCE_NODE_LIST,
      defaultValue
    );
  }
}

export { PlayerState };
