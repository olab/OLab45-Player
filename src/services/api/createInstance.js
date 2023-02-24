import axios from "axios";
import merge from "lodash.merge";
import defaultConfig from "./apiConfig";

const createInstance = (customConfig = {}) => {
  const newConfig = merge(customConfig, defaultConfig);
  const instance = axios.create(newConfig);
  return instance;
};

export default createInstance;
