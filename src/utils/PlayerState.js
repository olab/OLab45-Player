const persistantStorage = require('./PersistantStorage').PersistantStorage;

const KeyConstants = {
  ATRIUM: 'atrium',
  CONNECTION_INFO: 'connection-info',
  CONTEXT_ID: 'context-id',
  DEBUG: 'debug',
  DYNAMIC_OBJECTS: 'dynamic-objects',
  GLOBAL: null,
  MAP_STATIC: 'map-static',
  MAP: 'map',
  MAPS: 'maps',
  NODE_STATIC: 'node-static',
  NODE: 'node',
  SERVER_STATIC: 'server-static',
  SERVER: 'server',
  SESSION_INFO: 'session-info',
  VISIT_ONCE_NODE_LIST: 'visit-once-node-list',
}

class PlayerState {

  static clear(keyPrefix) {
    persistantStorage.clear(keyPrefix);
    persistantStorage.save(KeyConstants.GLOBAL, KeyConstants.DEBUG, {
      enableWikiRendering: true,
      disableCache: false
    });
  }

  // Get all settings as object
  static Get(keyPrefix = null) {

    const debug = persistantStorage.get(null, KeyConstants.DEBUG, {
      enableWikiRendering: true,
      disableCache: false
    });

    const contextId = persistantStorage.get(keyPrefix, KeyConstants.CONTEXT_ID, null);
    const dynamicObjects = persistantStorage.get(keyPrefix, KeyConstants.DYNAMIC_OBJECTS, null);
    const map = persistantStorage.get(keyPrefix, KeyConstants.MAP, null);
    const mapStatic = persistantStorage.get(keyPrefix, KeyConstants.MAP_STATIC, null);
    const node = persistantStorage.get(keyPrefix, KeyConstants.NODE, null);
    const nodeStatic = persistantStorage.get(keyPrefix, KeyConstants.NODE_STATIC, null);
    const server = persistantStorage.get(keyPrefix, KeyConstants.SERVER, null);
    const serverStatic = persistantStorage.get(keyPrefix, KeyConstants.SERVER_STATIC, null);
    const sessionInfo = persistantStorage.get(keyPrefix, KeyConstants.SESSION_INFO, { authInfo: { expires: 0 } });
    const visitOnceList = persistantStorage.get(keyPrefix, KeyConstants.VISIT_ONCE_NODE_LIST, []);

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
        server: serverStatic
      },
      nodesVisited: visitOnceList,
      sessionInfo: sessionInfo
    }
  }


  static GetDebug(defaultValue = {
    enableWikiRendering: true,
    disableCache: false
  }) {
    return persistantStorage.get(KeyConstants.GLOBAL, KeyConstants.DEBUG, defaultValue);
  }

  static GetAtrium(defaultValue = []) {
    return persistantStorage.get(null, KeyConstants.ATRIUM, defaultValue);
  }

  static SetAtrium(obj) {
    persistantStorage.save(null, KeyConstants.ATRIUM, obj);
  }

  static SetConnectionInfo(keyPrefix, obj) {
    persistantStorage.save(keyPrefix, KeyConstants.CONNECTION_INFO, obj);
  }

  static GetConnectionInfo(keyPrefix, defaultValue = { authInfo: { expires: 0, token: null } }) {
    return persistantStorage.get(keyPrefix, KeyConstants.CONNECTION_INFO, defaultValue);
  }

  static SetSessionInfo(keyPrefix, obj) {
    persistantStorage.save(keyPrefix, KeyConstants.SESSION_INFO, obj);
  }

  static GetSessionInfo(keyPrefix, defaultValue = { authInfo: { expires: 0, token: null } }) {
    return persistantStorage.get(keyPrefix, KeyConstants.SESSION_INFO, defaultValue);
  }

  static SetContextId(keyPrefix, obj) {
    persistantStorage.save(keyPrefix, KeyConstants.CONTEXT_ID, obj);
  }

  static GetContextId(keyPrefix, defaultValue = null) {
    return persistantStorage.get(keyPrefix, KeyConstants.CONTEXT_ID, defaultValue);
  }

  static SetMaps(obj) {
    persistantStorage.save(null, KeyConstants.MAPS, obj);
  }

  static GetMaps(defaultValue = []) {
    return persistantStorage.get(null, KeyConstants.MAPS, defaultValue);
  }

  static SetMap(keyPrefix, obj) {
    persistantStorage.save(keyPrefix, KeyConstants.MAP, obj);
  }

  static GetMap(keyPrefix, defaultValue = null) {
    return persistantStorage.get(keyPrefix, KeyConstants.MAP, defaultValue);
  }

  static SetMapStatic(keyPrefix, obj) {
    persistantStorage.save(keyPrefix, KeyConstants.MAP_STATIC, obj);
  }

  static GetMapStatic(keyPrefix, defaultValue = null) {
    return persistantStorage.get(keyPrefix, KeyConstants.MAP_STATIC, defaultValue);
  }

  static SetNode(keyPrefix, obj) {
    persistantStorage.save(keyPrefix, KeyConstants.NODE, obj);
  }

  static GetNode(keyPrefix, defaultValue = null) {
    return persistantStorage.get(keyPrefix, KeyConstants.NODE, defaultValue);
  }

  static SetNodeStatic(keyPrefix, obj) {
    persistantStorage.save(keyPrefix, KeyConstants.NODE_STATIC, obj);
  }

  static GetNodeStatic(keyPrefix, defaultValue = null) {
    return persistantStorage.get(keyPrefix, KeyConstants.NODE_STATIC, defaultValue);
  }

  static SetServerStatic(keyPrefix, obj) {
    persistantStorage.save(keyPrefix, KeyConstants.SERVER_STATIC, obj);
  }

  static GetServerStatic(keyPrefix, defaultValue = null) {
    return persistantStorage.get(keyPrefix, KeyConstants.SERVER_STATIC, defaultValue);
  }

  static SetDynamicObjects(keyPrefix, obj) {
    persistantStorage.save(keyPrefix, KeyConstants.DYNAMIC_OBJECTS, obj);
  }

  static GetDynamicObjects(keyPrefix, defaultValue = null) {
    return persistantStorage.get(keyPrefix, KeyConstants.DYNAMIC_OBJECTS, defaultValue);
  }

  static SetNodesVisited(keyPrefix, obj) {
    persistantStorage.save(keyPrefix, KeyConstants.VISIT_ONCE_NODE_LIST, obj);
  }

  static GetNodesVisited(keyPrefix, defaultValue = null) {
    return persistantStorage.get(keyPrefix, KeyConstants.VISIT_ONCE_NODE_LIST, defaultValue);
  }
}

export { PlayerState }