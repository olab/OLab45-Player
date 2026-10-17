// Constants.js

const cfg = {
  API_RETRY_COUNT: import.meta.env.VITE_API_RETRY_COUNT,
  API_URL: import.meta.env.VITE_API_URL,
  APP_BASEPATH: import.meta.env.VITE_BASEPATH,
  SIGNALR_TIMEOUT_MS: import.meta.env.VITE_SIGNALR_TIMEOUT_MS,
  TTALK_HUB_URL: import.meta.env.VITE_TTALK_HUB_URL,
  APPLICATION_ID: "PLAYER",
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || "info",
};

// console.log(JSON.stringify(cfg));
// export const config = process.env.NODE_ENV === "development" ? dev : prod;

export const config = cfg;
