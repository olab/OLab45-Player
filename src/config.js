// Constants.js

const cfg = {
  API_RETRY_COUNT: process.env.REACT_APP_API_RETRY_COUNT,
  API_URL: process.env.REACT_APP_API_URL,
  APP_BASEPATH: process.env.REACT_APP_BASEPATH,
  SIGNALR_TIMEOUT_MS: process.env.REACT_APP_SIGNALR_TIMEOUT_MS,
  TTALK_HUB_URL: process.env.REACT_APP_TTALK_HUB_URL,
  APPLICATION_ID: "PLAYER",
};

// export const config = process.env.NODE_ENV === "development" ? dev : prod;

export const config = cfg;
