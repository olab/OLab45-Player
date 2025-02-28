// @flow
export const isString = (value) => typeof value === "string";

export const isBoolean = (value) => typeof value === "boolean";

// export const isNumber = (value: any): boolean => !Number.isNaN(parseFloat(value));
export const isNumber = (value) =>
  /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/.test(value);

export const isPositiveInteger = (value) => /^-?\d+$/.test(value);
