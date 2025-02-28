import log from "loglevel";
import { config } from "../config";

// const PersistantStorage = require("./PersistantStorage").PersistantStorage;
import { PersistantStorage } from "./PersistantStorage";

const KeyConstants = {
  ATRIUM: "atrium",
  CONNECTION_INFO: "connection-info",
  CONTEXT_ID: "context-id",
  DEBUG: "debug",
  DYNAMIC_OBJECTS: "dynamic-objects",
  GLOBAL: null,
  IMPERSONATE_MODE: "impersonateMode",
  LOG_LEVEL: "logLevel",
  MAP_STATIC: "map-static",
  MAP: "map",
  MAPS: "maps",
  NODE_STATIC: "node-static",
  NODE: "node",
  SERVER_STATIC: "server-static",
  SERVER: "server",
  SESSION_INFO: "session-info",
  VISIT_ONCE_NODE_LIST: "visit-once-node-list",
  CLICK_ONCE_LINK_LIST: "click-once-link-list",
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
    // persist debug settings
    let debug = this.GetDebug();
    let logLevel = this.GetLogLevel();

    PersistantStorage.clear(this.storageKey);

    this.SetDebug(debug);
    this.SetLogLevel(logLevel);
  }

  static ClearMap() {
    const contextId = this.GetContextId();
    const sessionInfo = this.GetSessionInfo();
    const debugInfo = this.GetDebug();

    PersistantStorage.clear(this.storageKey);

    this.SetContextId(contextId);
    this.SetSessionInfo(sessionInfo);
    this.SetDebug(debugInfo);
  }

  // Get all settings as object
  static Get() {
    const debug = this.GetDebug();
    const logLevel = this.GetLogLevel();
    const contextId = this.GetContextId();
    const dynamicObjects = this.GetDynamicObjects();
    const map = this.GetMap();
    const mapStatic = this.GetMapStatic();
    const node = this.GetNode();
    const nodeStatic = this.GetNodeStatic();
    const server = PersistantStorage.get(KeyConstants.SERVER);
    const serverStatic = this.GetServerStatic();
    const sessionInfo = this.GetSessionInfo();
    const visitOnceList = this.GetNodesVisited();
    const clickOnceList = this.GetLinksClicked();

    return {
      debug: debug,
      logLevel: logLevel,
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
      linksClicked: clickOnceList,
      sessionInfo: sessionInfo,
    };
  }

  static GetLogLevel() {
    let debug = this.GetDebug();
    return debug[KeyConstants.LOG_LEVEL];
  }

  static SetLogLevel(obj) {
    let debug = this.GetDebug();
    debug[KeyConstants.LOG_LEVEL] = obj;
    this.SetDebug(debug);
  }

  static SetDebug(obj) {
    PersistantStorage.save(this.storageKey, KeyConstants.DEBUG, obj);
  }

  static GetDebug(
    defaultValue = {
      disableWikiRendering: false,
      disableCache: false,
      logLevel: "error",
    }
  ) {
    return PersistantStorage.get(
      this.storageKey,
      KeyConstants.DEBUG,
      defaultValue
    );
  }

  static GetWatchProfile(
    storageKey,
    defaultValue = { autoAssign: false, watchedLearners: [] }
  ) {
    return PersistantStorage.get(
      storageKey,
      KeyConstants.WATCH_PROFILE,
      defaultValue
    );
  }

  static SetWatchProfile(storageKey, obj) {
    PersistantStorage.save(storageKey, KeyConstants.WATCH_PROFILE, obj);
  }

  static GetAtrium(defaultValue = { roomName: "" }) {
    return PersistantStorage.get(
      this.storageKey,
      KeyConstants.ATRIUM,
      defaultValue
    );
  }

  static SetAtrium(obj = { roomName: "" }) {
    PersistantStorage.save(this.storageKey, KeyConstants.ATRIUM, obj);
  }

  static SetConnectionInfo(obj) {
    PersistantStorage.save(this.storageKey, KeyConstants.CONNECTION_INFO, obj);
  }

  static GetConnectionInfo(
    defaultValue = { authInfo: { expires: 0, token: null } }
  ) {
    return PersistantStorage.get(
      this.storageKey,
      KeyConstants.CONNECTION_INFO,
      defaultValue
    );
  }

  static SetSessionInfo(obj) {
    PersistantStorage.save(this.storageKey, KeyConstants.SESSION_INFO, obj);
  }

  static GetSessionInfo(defaultValue = { authInfo: { expires: 0 } }) {
    return PersistantStorage.get(
      this.storageKey,
      KeyConstants.SESSION_INFO,
      defaultValue
    );
  }

  static SetContextId(obj) {
    PersistantStorage.save(this.storageKey, KeyConstants.CONTEXT_ID, obj);
  }

  static GetContextId(defaultValue = null) {
    return PersistantStorage.get(
      this.storageKey,
      KeyConstants.CONTEXT_ID,
      defaultValue
    );
  }

  static SetMaps(obj) {
    PersistantStorage.save(this.storageKey, KeyConstants.MAPS, obj);
  }

  static GetMaps(defaultValue = []) {
    return PersistantStorage.get(
      this.storageKey,
      KeyConstants.MAPS,
      defaultValue
    );
  }

  static SetMap(obj) {
    PersistantStorage.save(this.storageKey, KeyConstants.MAP, obj);
  }

  static GetMap(defaultValue = null) {
    return PersistantStorage.get(
      this.storageKey,
      KeyConstants.MAP,
      defaultValue
    );
  }

  static SetMapStatic(obj) {
    PersistantStorage.save(this.storageKey, KeyConstants.MAP_STATIC, obj);
  }

  static GetMapStatic(defaultValue = null) {
    return PersistantStorage.get(
      this.storageKey,
      KeyConstants.MAP_STATIC,
      defaultValue
    );
  }

  static SetNode(obj) {
    PersistantStorage.save(this.storageKey, KeyConstants.NODE, obj);
  }

  static GetNode(defaultValue = null) {
    return PersistantStorage.get(
      this.storageKey,
      KeyConstants.NODE,
      defaultValue
    );
  }

  static SetImpersonateMode(value) {
    let sessionInfo = this.GetSessionInfo();
    sessionInfo[IMPERSONATE_MODE] = value;
    this.SetSessionInfo(sessionInfo);
  }

  static GetImpersonateMode() {
    let sessionInfo = this.GetSessionInfo();
    return sessionInfo[IMPERSONATE_MODE];
  }

  static SetNodeStatic(obj) {
    PersistantStorage.save(this.storageKey, KeyConstants.NODE_STATIC, obj);
  }

  static GetNodeStatic(defaultValue = null) {
    return PersistantStorage.get(
      this.storageKey,
      KeyConstants.NODE_STATIC,
      defaultValue
    );
  }

  static SetServerStatic(obj) {
    PersistantStorage.save(this.storageKey, KeyConstants.SERVER_STATIC, obj);
  }

  static GetServerStatic(defaultValue = null) {
    return PersistantStorage.get(
      this.storageKey,
      KeyConstants.SERVER_STATIC,
      defaultValue
    );
  }

  static SetDynamicObjects(obj) {
    PersistantStorage.save(this.storageKey, KeyConstants.DYNAMIC_OBJECTS, obj);
  }

  static GetDynamicObjects(defaultValue = null) {
    return PersistantStorage.get(
      this.storageKey,
      KeyConstants.DYNAMIC_OBJECTS,
      defaultValue
    );
  }

  static SetNodesVisited(obj) {
    PersistantStorage.save(
      this.storageKey,
      KeyConstants.VISIT_ONCE_NODE_LIST,
      obj
    );
  }

  static GetNodesVisited(defaultValue = []) {
    return PersistantStorage.get(
      this.storageKey,
      KeyConstants.VISIT_ONCE_NODE_LIST,
      defaultValue
    );
  }

  static SetLinksClicked(obj) {
    PersistantStorage.save(
      this.storageKey,
      KeyConstants.CLICK_ONCE_LINK_LIST,
      obj
    );
  }

  static GetLinksClicked(defaultValue = []) {
    return PersistantStorage.get(
      this.storageKey,
      KeyConstants.CLICK_ONCE_LINK_LIST,
      defaultValue
    );
  }
}

export { PlayerState };
