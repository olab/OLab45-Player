import log from 'loglevel';
import { config } from '../config';
const persistantStorage = require('../utils/StateStorage').PersistantStateStorage;

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
      log.error(error);
    })
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

async function getMapNode(props, mapId, nodeId) {

  let token = props.authActions.getToken();
  let url = `${config.API_URL}/maps/${mapId}/node/${nodeId}`;
  log.debug(`getMapNode(${mapId}, ${nodeId}) url: ${url})`);
  let sessionId = persistantStorage.get('sessionId');

  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'OLabSessionId': sessionId
    }
  })
    .then((data) => {
      if (data.status === 402) {
        props.authActions.logout();
      }

      return data.json();
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

async function submitQuestionValue(state) {

  const { map, node, authActions, dynamicObjects, question, responseId, value, setInProgress, sessionId } = state;

  let token = authActions.getToken();
  let url = `${config.API_URL}/response/${question.id}`;

  log.debug(`submitQuestionValue(${question.id}, ${responseId}, ${value}, [func]) url: ${url})`);

  if (typeof setInProgress !== 'undefined') {
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

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'OLabSessionId': sessionId
    },
    body: JSON.stringify(body)
  })
    .then((data) => {

      if (typeof setInProgress !== 'undefined') {
        setInProgress(false);
      }

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
  getMap,
  getMaps,
  getDownload,
  getMapScopedObjects,
  getMapNode,
  getNodeScopedObjects,
  getServerScopedObjects,
  getDynamicScopedObjects,
  importer,
  submitQuestionValue
};
