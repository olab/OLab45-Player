import { Log, LogInfo, LogError } from "../utils/Logger";
import log from "loglevel";
import { config } from "../config";
const playerState = require("../utils/PlayerState").PlayerState;

let retryCount = 10;
if (config?.API_RETRY_COUNT) {
  retryCount = Number(config.API_RETRY_COUNT);
}

async function internetJsonFetch(
  method,
  url,
  payload,
  headerOverrides = null,
  settingsOverrides = null
) {
  let tries = 0;

  let headers = {
    "Content-Type": "application/json",
    ...headerOverrides,
  };

  let settings = {
    method: method,
    headers: headers,
    ...settingsOverrides,
  };

  if (payload) {
    settings.body = JSON.stringify(payload);
    log.debug(`URL: ${url} payload: ${settings.body})`);
  }

  while (tries++ < retryCount) {
    try {
      settings.signal = AbortSignal.timeout(30000);
      const response = await fetch(url, settings);

      let data = {};

      if (settings.responseType == "blob") {
        data.body = response.body;
        data.error_code = 200;
      } else {
        data = await response.json();
      }

      if (data.error_code === 401) {
        log.error(`URL '${url}': access denied ${JSON.stringify(data)}`);
        return data;
      }

      if (data.error_code === 500) {
        log.error(`URL '${url}': server error ${JSON.stringify(data)}`);
        return data;
      }

      if (data.error_code !== 200) {
        log.error(
          `URL '${url}': ${JSON.stringify(data)}. try ${tries} of ${retryCount}`
        );
      } else {
        return data;
      }
    } catch (error) {
      log.error(
        `URL '${url}': ${error.message}. try ${tries} of ${retryCount}`
      );
    }
  }

  log.error(`URL '${url}': max retries ${retryCount} exceeded`);

  return {
    data: "max retries exceeded",
    errorCode: 500,
    message: `${URL}: server error`,
  };
}

async function loginUserAsync(credentials) {
  var payload = {
    UserName: credentials.username,
    Password: credentials.password,
  };
  let url = `${config.API_URL}/auth/login`;

  return await internetJsonFetch("POST", url, payload);
}

async function loginExternalUserAsync(token) {
  let payload = { ExternalToken: token };
  let url = `${config.API_URL}/auth/loginexternal`;

  return await internetJsonFetch("POST", url, payload);
}

async function loginAnonymousUserAsync(mapId) {
  let url = `${config.API_URL}/auth/loginanonymous/${mapId}`;
  return await internetJsonFetch("GET", url, null);
}

async function isMapAnonymous(mapId) {
  let url = `${config.API_URL}/maps/accesstype/${mapId}`;
  return await internetJsonFetch("GET", url, null);
}

async function getMap(props, mapId) {
  let url = `${config.API_URL}/maps/${mapId}/shortstatus`;
  let token = props.authActions.getToken();

  const data = await internetJsonFetch("GET", url, null, {
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code != 200) {
    throw new Error(`Error retrieving map ${mapId}: ${data.data}`);
  }

  return data;
}

async function getMaps(props) {
  let url = `${config.API_URL}/maps`;
  let token = props.authActions.getToken();

  const data = await internetJsonFetch("GET", url, null, {
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code != 200) {
    throw new Error(`Error retrieving maps`);
  }

  return data;
}

async function getMapNode(props, mapId, nodeId, dynamicObjects) {
  let token = props.authActions.getToken();
  let url = `${config.API_URL}/maps/${mapId}/node/${nodeId}`;
  let contextId = playerState.GetContextId();

  const data = await internetJsonFetch("POST", url, dynamicObjects, {
    OLabSessionId: contextId,
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code != 200) {
    throw new Error(`Error retrieving map node: ${mapId}/${nodeId}`);
  }

  return data;
}

async function getNodeScopedObjects(props, nodeId) {
  let token = props.authActions.getToken();
  let url = `${config.API_URL}/nodes/${nodeId}/scopedObjects`;

  const data = await internetJsonFetch("GET", url, null, {
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code != 200) {
    throw new Error(`Error retrieving map node scoped: ${nodeId}`);
  }

  return data;
}

async function getDynamicScopedObjects(props, mapId, nodeId) {
  let token = props.authActions.getToken();
  let url = `${config.API_URL}/maps/${mapId}/nodes/${nodeId}/dynamicobjects`;

  const data = await internetJsonFetch("GET", url, null, {
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code != 200) {
    throw new Error(`Error retrieving dynamic scoped: ${mapId}/${nodeId}`);
  }

  return data;
}

async function getServerScopedObjects(props, serverId) {
  let token = props.authActions.getToken();
  let url = `${config.API_URL}/servers/${serverId}/scopedObjects`;

  const data = await internetJsonFetch("GET", url, null, {
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code != 200) {
    throw new Error(`Error retrieving server scoped: ${serverId}`);
  }

  return data;
}

async function postQuestionValue(state) {
  const {
    map,
    node,
    authActions,
    dynamicObjects,
    question,
    responseId,
    value,
    setInProgress,
    contextId,
  } = state;

  let token = authActions.getToken();
  let url = `${config.API_URL}/response/${question.id}`;

  log.debug(
    `postQuestionValue(${question.id}, ${responseId}, ${value}, [func]) url: ${url})`
  );

  // signal to caller that we are starting the work
  if (setInProgress) {
    setInProgress(true);
  }

  let body = {
    mapId: map.id,
    nodeId: node.id,
    questionId: question.id,
    responseId: question.responseId,
    previousResponseId: question.previousResponseId,
    value: question.valueOverride ?? question.value,
    previousValue: question.previousValue,
    dynamicObjects: dynamicObjects,
  };

  const data = await internetJsonFetch("POST", url, body, {
    Authorization: `Bearer ${token}`,
    OLabSessionId: contextId,
  });

  if (!setInProgress) {
    setInProgress(false);
  }

  // if (data.error_code === 401) {
  //   authActions.logout();
  // }

  if (data.error_code === 200) {
    return data;
  }

  return { data: null };
}

async function getDownload(props, file) {
  let token = props.authActions.getToken();
  let url = `${config.API_URL}/filescontent/${file.id}`;
  var anchorTagId = `file-link-${file.id}`;
  let anchorElement = document.getElementById(anchorTagId);

  log.debug(`getDownload(${file.id}) url: ${url})`);

  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((data) => {
      // if (data.status === 401) {
      //   props.authActions.logout();
      // }
      return data;
    })
    .then((response) => response.blob())
    .then((blob) => {
      var windowUrl = window.URL || window.webkitURL;
      var url = windowUrl.createObjectURL(blob);

      anchorElement.setAttribute("href", url);
      anchorElement.setAttribute("download", file.path);
      anchorElement.onclick();

      windowUrl.revokeObjectURL(url);
    })
    .catch(function (error) {
      alert("Fetch error: " + error.message);
      LogError(error);
    });
}

async function importer(props, fileName) {
  var payload = { fileName: fileName };
  let url = `${config.API_URL}/import/post`;
  let token = props.authActions.getToken();

  const data = await internetJsonFetch("POST", url, payload, {
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code === 200) {
    return data;
  }

  // if (data.error_code === 401) {
  //   props.authActions.logout();
  // }

  throw new Error(`Error ${url}`, { cause: data });
}

async function getSessionReport(props, contextId) {
  const token = props.authActions.getToken();
  const url = `${config.API_URL}/reports/${contextId}`;

  log.debug(`getSessionReport(${props.map?.id}) url: ${url})`);

  const data = await internetJsonFetch("GET", url, null, {
    Authorization: `Bearer ${token}`,
  });

  return data;
}

async function getMapScopedObjects(props, mapId) {
  let url = `${config.API_URL}/maps/${mapId}/scopedObjects`;
  let token = props.authActions.getToken();

  const data = await internetJsonFetch("GET", url, null, {
    Authorization: `Bearer ${token}`,
  });

  return data;
}

async function getMapSessions(props, mapId) {
  let url = `${config.API_URL}/maps/${mapId}/sessions`;
  let token = props.authActions.getToken();

  const data = await internetJsonFetch("GET", url, null, {
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code != 200) {
    throw new Error(`Error retrieving map sessions ${mapId}: ${data.data}`);
  }

  return data;
}

async function getUserSession(props, payload) {
  let url = `${config.API_URL}/sessions`;
  let token = props.authActions.getToken();

  const data = await internetJsonFetch(
    "POST",
    url,
    payload,
    { Authorization: `Bearer ${token}` },
    { responseType: "blob" }
  );

  return data;
}

export {
  getDownload,
  getUserSession,
  loginUserAsync,
  loginAnonymousUserAsync,
  loginExternalUserAsync,
  getDynamicScopedObjects,
  getMap,
  isMapAnonymous,
  getMapNode,
  getMaps,
  getMapScopedObjects,
  getNodeScopedObjects,
  getServerScopedObjects,
  getSessionReport,
  importer,
  postQuestionValue,
  getMapSessions,
};
