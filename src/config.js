// Constants.js
const prod = {
  API_URL: "https://logan.cardinalcreek.ca/olab/api/v3",
  TTALK_HUB_URL: "https://logan.cardinalcreek.ca/turktalk",
  SIGNALR_TIMEOUT_MS: 180000,
  API_RETRY_COUNT: 10,
};

const dev = {
  API_URL: "https://everest.cardinalcreek.ca/olab/api/v3",
  TTALK_HUB_URL: "https://everest.cardinalcreek.ca/turktalk",
  SIGNALR_TIMEOUT_MS: 180000,
  API_RETRY_COUNT: 10,
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;
