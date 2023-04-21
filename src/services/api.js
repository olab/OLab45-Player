import { Log, LogInfo, LogError } from "../utils/Logger";
import log from "loglevel";
import { config } from "../config";
const playerState = require("../utils/PlayerState").PlayerState;

async function internalFetch(method, url, payload, headerOverrides = null) {
  let tries = 0;

  let headers = {
    "Content-Type": "application/json",
    ...headerOverrides,
  };

  let settings = {
    signal: AbortSignal.timeout(7500),
    method: method,
    headers: headers,
  };

  if (payload) {
    settings.body = JSON.stringify(payload);
    log.debug(`URL: ${url} payload: ${settings.body})`);
  }

  while (tries++ < 5) {
    try {
      const response = await fetch(url, settings);

      const jsonData = await response.json();
      return jsonData;
    } catch (error) {
      log.error(`URL '${url}': ${error.message}`);
    }
  }

  log.error(`URL '${url}': max retries exceeded`);

  return null;
}

async function loginUserAsync(credentials) {
  var payload = {
    UserName: credentials.username,
    Password: credentials.password,
  };
  let url = `${config.API_URL}/auth/login`;

  return await internalFetch("POST", url, payload);
}

async function loginExternalUserAsync(token) {
  let payload = { ExternalToken: token };
  let url = `${config.API_URL}/auth/loginexternal`;

  return await internalFetch("POST", url, payload);
}

async function loginAnonymousUserAsync(mapId) {
  let url = `${config.API_URL}/auth/loginanonymous/${mapId}`;

  return await internalFetch("GET", url, null);
}

async function importer(props, fileName) {
  var payload = { fileName: fileName };
  let url = `${config.API_URL}/import/post`;
  let token = props.authActions.getToken();

  const data = await internalFetch("POST", url, payload, {
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code === 200) {
    return data;
  }

  if (data.error_code === 402) {
    props.authActions.logout();
  }

  throw new Error(`Error ${url}`, { cause: data });
}

async function getMap(props, mapId) {
  let url = `${config.API_URL}/maps/${mapId}`;
  let token = props.authActions.getToken();

  const data = await internalFetch("GET", url, null, {
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code === 200) {
    return data;
  }

  if (data.error_code === 402) {
    props.authActions.logout();
  }

  throw new Error(`Error ${url}`, { cause: data });
}

async function getMaps(props) {
  let url = `${config.API_URL}/maps`;
  let token = props.authActions.getToken();

  const data = await internalFetch("GET", url, null, {
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code === 200) {
    return data;
  }

  if (data.error_code === 402) {
    props.authActions.logout();
  }

  throw new Error(`Error ${url}`, { cause: data });
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
      if (data.status === 402) {
        props.authActions.logout();
      }
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

async function getSessionReport(props, contextId) {
  const token = props.authActions.getToken();
  const url = `${config.API_URL}/reports/${contextId}`;

  log.debug(`getSessionReport(${props.map?.id}) url: ${url})`);

  const data = await internalFetch("GET", url, null, {
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code === 200) {
    return data;
  }

  if (data.error_code === 402) {
    props.authActions.logout();
  }

  let message = data.error_code;
  if (data.status == 401) {
    message = "Not Authorized";
  }

  throw new Error(
    `Error ${data.statusText} retrieving map. Reason: ${message}`,
    { cause: data }
  );

  // @Corey, I've added this line to catch any misc HTTP errors meanwhile
  // .catch(
  //   (error) =>
  //     void log.debug(
  //       `getSessionReport(${props.map?.id}) error: ${error.stack})`
  //     )
  // )
}

async function getSessionReportDownloadUrl(props, contextId) {
  // @Corey, this will need backend implementation for an application/octet-stream download (excel)
  const url = `${config.API_URL}/reports/${contextId}/excel`;
  return url;
}

async function getMapScopedObjects(props, mapId) {
  let url = `${config.API_URL}/maps/${mapId}/scopedObjects`;
  let token = props.authActions.getToken();

  const data = await internalFetch("GET", url, null, {
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code === 200) {
    return data;
  }

  if (data.error_code === 402) {
    props.authActions.logout();
  }

  throw new Error(`Error ${url}`, { cause: data });
}

async function getMapNode(props, mapId, nodeId, dynamicObjects) {
  let token = props.authActions.getToken();
  let url = `${config.API_URL}/maps/${mapId}/node/${nodeId}`;
  let contextId = playerState.GetContextId(null);

  const data = await internalFetch("POST", url, dynamicObjects, {
    OLabSessionId: contextId,
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code === 200) {
    return data;
  }

  if (data.error_code === 402) {
    props.authActions.logout();
  }

  let message = data.status;
  if (data.status == 401) {
    message = "Not Authorized";
  }

  throw new Error(
    `Error ${data.statusText} retrieving node. Reason: ${message}`,
    { cause: data }
  );
}

async function getNodeScopedObjects(props, nodeId) {
  let token = props.authActions.getToken();
  let url = `${config.API_URL}/nodes/${nodeId}/scopedObjects`;

  const data = await internalFetch("GET", url, null, {
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code === 200) {
    return data;
  }

  if (data.error_code === 402) {
    props.authActions.logout();
  }

  let message = data.status;
  if (data.status == 401) {
    message = "Not Authorized";
  }

  throw new Error(
    `Error ${data.statusText} retrieving node. Reason: ${message}`,
    { cause: data }
  );
}

async function getDynamicScopedObjects(props, mapId, nodeId) {
  let token = props.authActions.getToken();
  let url = `${config.API_URL}/maps/${mapId}/nodes/${nodeId}/dynamicobjects`;

  const data = await internalFetch("GET", url, null, {
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code === 200) {
    return data;
  }

  if (data.error_code === 402) {
    props.authActions.logout();
  }

  let message = data.status;
  if (data.status == 401) {
    message = "Not Authorized";
  }

  throw new Error(
    `Error ${data.statusText} retrieving node. Reason: ${message}`,
    { cause: data }
  );
}

async function getServerScopedObjects(props, serverId) {
  let token = props.authActions.getToken();
  let url = `${config.API_URL}/servers/${serverId}/scopedObjects`;

  const data = await internalFetch("GET", url, null, {
    Authorization: `Bearer ${token}`,
  });

  if (data.error_code === 200) {
    return data;
  }

  if (data.error_code === 402) {
    props.authActions.logout();
  }

  let message = data.status;
  if (data.status == 401) {
    message = "Not Authorized";
  }

  throw new Error(
    `Error ${data.statusText} retrieving node. Reason: ${message}`,
    { cause: data }
  );
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
    value: question.value,
    previousValue: question.previousValue,
    dynamicObjects: dynamicObjects,
  };

  const data = await internalFetch("POST", url, body, {
    Authorization: `Bearer ${token}`,
    OLabSessionId: contextId,
  });

  if (!setInProgress) {
    setInProgress(false);
  }

  if (data.error_code === 402) {
    authActions.logout();
  }

  if (data.error_code === 200) {
    return data;
  }

  return { data: null };
}

export {
  getDownload,
  loginUserAsync,
  loginAnonymousUserAsync,
  loginExternalUserAsync,
  getDynamicScopedObjects,
  getMap,
  getMapNode,
  getMaps,
  getMapScopedObjects,
  getNodeScopedObjects,
  getServerScopedObjects,
  getSessionReport,
  getSessionReportDownloadUrl,
  importer,
  postQuestionValue,
};
