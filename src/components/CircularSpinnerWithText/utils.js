// @flow
import { SIZES } from "./config";

const getSize = (small, medium, large) => {
  switch (true) {
    case small:
      return SIZES.SMALL;
    case large:
      return SIZES.LARGE;
    case medium:
      return SIZES.MEDIUM;
    default:
      return SIZES.MEDIUM;
  }
};

export default getSize;
