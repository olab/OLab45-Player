// Constants.js
const prod = {
  API_URL: "https://olabdevapi.azurewebsites.net/olab/api/v3",
  TTALK_HUB_URL: "https://olabdevapi.azurewebsites.net/turktalk",
  SIGNALR_TIMEOUT_MS: 180000,
  API_RETRY_COUNT: 10,
};

const dev = {
  API_URL: "https://olabdevapi.azurewebsites.net/olab/api/v3",
  TTALK_HUB_URL: "http://localhost:7071/turktalk",
  SIGNALR_TIMEOUT_MS: 180000,
  API_RETRY_COUNT: 10,
};

const cfg = {
  API_RETRY_COUNT: process.env.REACT_APP_API_RETRY_COUNT,
  API_URL: process.env.REACT_APP_API_URL,
  APP_BASEPATH: process.env.REACT_APP_BASEPATH,
  SIGNALR_TIMEOUT_MS: process.env.REACT_APP_SIGNALR_TIMEOUT_MS,
  TTALK_HUB_URL: process.env.REACT_APP_TTALK_HUB_URL,
};

// export const config = process.env.NODE_ENV === "development" ? dev : prod;

export const config = cfg;
