import log from "loglevel";
import {
  loginAnonymousUserAsync,
  loginExternalUserAsync,
} from "../services/api";

function processUrl() {
  let mapId = null;
  let nodeId = null;
  let accessToken = null;

  const urlParts = window.location.pathname.split("/");
  const partsCount = urlParts.length;

  if (partsCount >= 2) {
    mapId = urlParts[partsCount - 2];
    if (isNaN(mapId)) {
      mapId = null;
    } else {
      mapId = Number(mapId);
    }

    nodeId = urlParts[partsCount - 1];
    if (isNaN(nodeId)) {
      nodeId = null;
    } else {
      nodeId = Number(nodeId);
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  accessToken = urlParams.get("token");

  return [mapId, nodeId, accessToken];
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
