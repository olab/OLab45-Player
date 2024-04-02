import { config } from "../../config";

const defaultConfig = {
  baseURL: config.API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: null,
  },
};

export default defaultConfig;
