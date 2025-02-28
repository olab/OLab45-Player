// @flow
const removeHTMLTags = (text) => {
  const regex = /(<([^>]+)>)/gi;
  const result = text.replace(regex, "");

  return result;
};

export default removeHTMLTags;
