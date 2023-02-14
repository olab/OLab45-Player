import { Log, LogInfo, LogError } from '../utils/Logger';
import log from 'loglevel';
import { config } from '../config';
const playerState = require('../utils/PlayerState').PlayerState;

async function importer(props, fileName) {

  let token = props.authActions.getToken();
  let url = `${config.API_URL}/import/post`;
  log.debug(`importer(${fileName}) url: ${url})`);

  var body = { fileName: fileName };

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })
    .then((data) => {
      if (data.status === 402) {
        props.authActions.logout();
      }
      return data.json();
    });
}

async function getMap(props, mapId) {

  let token = props.authActions.getToken();
  let url = `${config.API_URL}/maps/${mapId}`;
  log.debug(`getMap(${mapId}) url: ${url})`);

  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
    .then((data) => {
      if (data.status === 402) {
        props.authActions.logout();
      }
      return data.json();
    });
}

async function getMaps(props) {

  let token = props.authActions.getToken();
  let url = `${config.API_URL}/maps`;
  log.debug(`getMaps() url: ${url})`);

  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
    .then((data) => {
      if (data.status === 402) {
        props.authActions.logout();
      }
      return data.json();
    })
    .catch(function (error) {
      alert(`Failed to fetch maps`);
      var data = { data: [] };
      return data;
    });
}

async function getDownload(props, file) {

  let token = props.authActions.getToken();
  let url = `${config.API_URL}/filescontent/${file.id}`;
  var anchorTagId = `file-link-${file.id}`;
  let anchorElement = document.getElementById(anchorTagId);

  log.debug(`getDownload(${file.id}) url: ${url})`);

  return fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
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

      anchorElement.setAttribute('href', url);
      anchorElement.setAttribute('download', file.path);
      anchorElement.onclick();

      windowUrl.revokeObjectURL(url);
    })
    .catch(function (error) {
      alert('Fetch error: ' + error.message);
      LogError(error);
    })
}

async function getSessionReport(props, contextId) {
  const token = props.authActions.getToken();
  const url = `${config.API_URL}/reports/${contextId}`;

  log.debug(`getSessionReport(${props.map?.id}) url: ${url})`);

  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
    .then((data) => {
      if (data.status === 402) {
        props.authActions.logout();
      }
      return data.json();
    })
    // @Corey, I've added this line to catch any misc HTTP errors meanwhile
    .catch((error) => void log.debug(`getSessionReport(${props.map?.id}) error: ${error.stack})`))
}

async function getSessionReportDownloadUrl(props, contextId) {
  // @Corey, this will need backend implementation for an application/octet-stream download (excel)
  const url = `${config.API_URL}/reports/${contextId}/excel`;
  return url;
}

async function getMapScopedObjects(props, mapId) {

  let token = props.authActions.getToken();
  let url = `${config.API_URL}/maps/${mapId}/scopedObjects`;
  log.debug(`getMapScopedObjects(${mapId}) url: ${url})`);

  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
    .then((data) => {
      if (data.status === 402) {
        props.authActions.logout();
      }
      return data.json();
    });
}

async function getMapNode(props, mapId, nodeId, dynamicObjects) {

  let token = props.authActions.getToken();
  let url = `${config.API_URL}/maps/${mapId}/node/${nodeId}`;
  log.debug(`getMapNode(${mapId}, ${nodeId}) url: ${url})`);
  let contextId = playerState.GetContextId( null );

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'OLabSessionId': contextId
    },
    body: JSON.stringify( dynamicObjects )
  })
    .then((data) => {

      if (data.status === 402) {
        props.authActions.logout();
      }

      else if ( data.status === 200 ) {
        return data.json();
      }

      throw new Error(`Error ${data.statusText} retrieving node ${nodeId} `);

    });
}

async function getNodeScopedObjects(props, nodeId) {

  let token = props.authActions.getToken();
  let url = `${config.API_URL}/nodes/${nodeId}/scopedObjects`;
  log.debug(`getNodeScopedObjects(${nodeId}) url: ${url})`);

  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
    .then((data) => {
      if (data.status === 402) {
        props.authActions.logout();
      }
      return data.json();
    });
}

async function getDynamicScopedObjects(props, mapId, nodeId) {

  let token = props.authActions.getToken();
  let url = `${config.API_URL}/maps/${mapId}/nodes/${nodeId}/dynamicobjects`;
  log.debug(`getDynamicScopedObjects(${nodeId}) url: ${url})`);

  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
    .then((data) => {
      if (data.status === 402) {
        props.authActions.logout();
      }
      return data.json();
    });
}

async function getServerScopedObjects(props, serverId) {

  let token = props.authActions.getToken();
  let url = `${config.API_URL}/servers/${serverId}/scopedObjects`;
  log.debug(`getServerScopedObjects(${serverId}) url: ${url})`);

  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
    .then((data) => {
      if (data.status === 402) {
        props.authActions.logout();
      }
      return data.json();
    });
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
    contextId } = state;

  let token = authActions.getToken();
  let url = `${config.API_URL}/response/${question.id}`;

  log.debug(`postQuestionValue(${question.id}, ${responseId}, ${value}, [func]) url: ${url})`);

  // signal to caller that we are starting the work
  if (setInProgress) { setInProgress(true); }

  let body = {
    mapId: map.id,
    nodeId: node.id,
    questionId: question.id,
    responseId: question.responseId,
    previousResponseId: question.previousResponseId,
    value: question.value,
    previousValue: question.previousValue,
    dynamicObjects: dynamicObjects
  };

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'OLabSessionId': contextId
    },
    body: JSON.stringify(body)
  })
    .then((data) => {

      // signal to caller that we are done the work
      if (!setInProgress) { setInProgress(false); }

      if (data.status === 402) {
        authActions.logout();
      }

      if (data.status === 200) {
        return data.json();
      }

      return { data: null };
    });
}

export {
  getDownload,
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
