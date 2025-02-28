// Constants.js

const cfg = {
  API_RETRY_COUNT: import.meta.env.VITE_APP_API_RETRY_COUNT,
  API_URL: import.meta.env.VITE_APP_API_URL,
  APP_BASEPATH: import.meta.env.VITE_APP_BASEPATH,
  SIGNALR_TIMEOUT_MS: import.meta.env.VITE_APP_SIGNALR_TIMEOUT_MS,
  TTALK_HUB_URL: import.meta.env.VITE_APP_TTALK_HUB_URL,
  APPLICATION_ID: "PLAYER",
};

console.log(JSON.stringify(cfg));
// export const config = process.env.NODE_ENV === "development" ? dev : prod;

export const config = cfg;
