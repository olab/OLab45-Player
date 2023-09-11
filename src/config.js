// Constants.js
const prod = {
  API_URL: process.env.API_URL,
  TTALK_HUB_URL: process.env.TTALK_HUB_URL,
  SIGNALR_TIMEOUT_MS: process.env.SIGNALR_TIMEOUT_MS,
  API_RETRY_COUNT: process.env.API_RETRY_COUNT,
};

const dev = {
  API_URL: "https://olabdevapi.azurewebsites.net/olab/api/v3",
  TTALK_HUB_URL: "https://localhost:5002/turktalk",
  SIGNALR_TIMEOUT_MS: 180000,
  API_RETRY_COUNT: 10,
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;
