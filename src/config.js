// Constants.js
const prod = {
  API_URL: "https://logan.cardinalcreek.ca/olab/api/v3",
  TTALK_HUB_URL: "https://logan.cardinalcreek.ca/turktalk",
};

const dev = {
  API_URL: "https://localhost:5001/olab/api/v3",
  TTALK_HUB_URL: "https://localhost:5002/turktalk",
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;
