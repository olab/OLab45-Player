// @flow
const filterByName = (items, queryStr) => {
  const queryStrClear = queryStr.trim().toLowerCase();
  const itemsFiltered = items.filter(({ name }) =>
    (name || "").toLowerCase().includes(queryStrClear)
  );

  return itemsFiltered;
};

export default filterByName;
