import log from "loglevel";
import {
  loginAnonymousUserAsync,
  loginExternalUserAsync,
} from "../services/api";

function processUrl() {
  let mapId = null;
  let nodeId = null;

  const urlParts = window.location.pathname.split("/");
  if (urlParts.length == 4) {
    mapId = urlParts[2];
    if (isNaN(mapId)) {
      mapId = null;
    } else {
      mapId = Number(mapId);
    }

    nodeId = urlParts[3];
    if (isNaN(nodeId)) {
      nodeId = null;
    } else {
      nodeId = Number(nodeId);
    }

    return [mapId, nodeId];
  }

  return [null, null];
}

const submitAnonymousMapId = async (mapId) => {
  try {
    let data = await loginAnonymousUserAsync(mapId);
    if (!data.statusCode) data.statusCode = 200;
    return data;
  } catch (error) {
    return { statusCode: 500, message: error.message };
  }
};

const submitExternalToken = async (queryToken) => {
  try {
    let data = await loginExternalUserAsync(queryToken);
    data.statusCode = data.error_code;
    return data;
  } catch (error) {
    return { statusCode: 500, message: error.message };
  }
};

export { processUrl, submitAnonymousMapId, submitExternalToken };
