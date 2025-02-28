// @flow
import { isPositiveInteger } from "./dataTypes";

const filterByIndex = (items, queryStr) => {
  let itemsFiltered = [];
  if (isPositiveInteger(queryStr)) {
    itemsFiltered = items.filter(({ id }) => Number(id) === Number(queryStr));
  }
  return itemsFiltered;
};

export default filterByIndex;
