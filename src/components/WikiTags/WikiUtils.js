import ErrorPopup from "../ErrorPopup/ErrorPopup";
import OlabAttendeeTag from "./Question/TurkTalk/Turkee/Turkee";
import OlabConstantTag from "./Constant/Constant";
import OlabCountersTag from "./Counters/Counter";
import OlabCounterTag from "./Counter/Counter";
import OlabLinksTag from "./Links/Links";
import OlabMediaResourceTag from "./MediaResource/MediaResource";
import OlabModeratorTag from "./Question/TurkTalk/Turker/Turker";
import OlabQuestionTag from "./Question/Question";

import OlabDragAndDropQuestion from "./Question/DragAndDrop/DragAndDrop";
import OlabDropDownQuestion from "./Question/DropDown/DropDown";
import OlabMultilineTextQuestion from "./Question/MultilineText/MultilineText";
import OlabMultiPickQuestion from "./Question/MultiplePick/MultiplePick";
import OlabSinglelineTextQuestion from "./Question/SingleLineText/SingleLineText";
import OlabSinglePickQuestion from "./Question/SinglePick/SinglePick";
import OlabSliderQuestion from "./Question/Slider/Slider";

import OlabReportTag from "./Report/Report";
import OlabScriptTag from "./Script/Script";
import OlabSessionTag from "./Session/Session";
import log from "loglevel";

const findWikiInList = (list, wiki) => {
  let match = null;

  for (let element of list) {
    if (element.name === wiki || element.id === Number(wiki)) {
      match = element;
      break;
    }
  }

  if (match == null) {
    throw new Error(`object '${wiki}' not found`);
  }
  return match;
};

const getCounters = (nodeId, mapCounters, counterActions) => {
  let items = [];

  try {
    for (const mapCounter of mapCounters) {
      if (mapCounter.scopeLevel != "Maps") {
        continue;
      }

      var nodeCounterAction = counterActions.find(
        (action) => action.nodeId == nodeId && action.counterId == mapCounter.id
      );

      if (typeof nodeCounterAction !== "undefined") {
        if (nodeCounterAction.display !== 1) {
          continue;
        }
      }

      items.push(mapCounter);
    }
  } catch (error) {
    log.error(`error looking up counters: ${error}`);
  }

  return items;
};

const getFile = (name, props) => {
  let item = null;

  try {
    const {
      props: {
        scopedObjects: { map, node, server },
      },
    } = props;

    const array = [...node?.files, ...map?.files, ...server?.files];

    item = findWikiInList(array, name);

    if (item.name != null) {
      item.htmlIdBase = `FILE:${item.name}`;
    } else {
      item.htmlIdBase = `FILE:${item.id}`;
    }
  } catch (error) {
    log.error(`error looking up file ${name}: ${error}`);
  }

  return item;
};

const getCounter = (name, dynamicObjects) => {
  let item = null;

  try {
    const { counters } = dynamicObjects;

    item = findWikiInList(counters, name);

    if (item.name != null) {
      item.htmlIdBase = `CR:${item.name}`;
    } else {
      item.htmlIdBase = `CR:${item.id}`;
    }
  } catch (error) {
    log.error(`error looking up counter ${name}: ${error}`);
  }

  return item;
};

const getQuestion = (name, props) => {
  let item = null;

  try {
    const {
      props: {
        scopedObjects: { map, node, server },
      },
    } = props;

    item = findWikiInList(
      [...node?.questions, ...map?.questions, ...server?.questions],
      name
    );

    if (item.questionType !== 3 && item.questionType !== 2) {
      if (item.value === null) {
        item.value = 0;
      }
    } else {
      if (item.value === null) {
        item.value = "";
      }
    }

    if (item.width === 0) {
      item.width = 300;
    }

    if (item.name != null) {
      item.htmlIdBase = `QU:${item.name}`;
    } else {
      item.htmlIdBase = `QU:${item.id}`;
    }
  } catch (error) {
    log.error(`error looking up question ${name}: ${error}`);
  }

  return item;
};

const getConstant = (name, props) => {
  let item = null;

  try {
    const {
      props: {
        scopedObjects: { map, node, server },
      },
    } = props;

    item = findWikiInList(
      [...node?.constants, ...map?.constants, ...server?.constants],
      name
    );

    if (item.name != null) {
      item.htmlIdBase = `CONST:${item.name}`;
    } else {
      item.htmlIdBase = `CONST:${item.id}`;
    }
  } catch (error) {
    log.error(`error looking up constant ${name}: ${error}`);
  }

  return item;
};

const getScript = (name, props) => {
  let item = null;

  try {
    const {
      props: {
        scopedObjects: { map, node, server },
      },
    } = props;

    const array = [...node?.scripts, ...map?.scripts, ...server?.scripts];

    item = findWikiInList(array, name);

    if (item == null) {
      log.error(`Could not find script '${name}'`);
    }
  } catch (error) {
    log.error(`error looking up script ${name}: ${error}`);
  }

  return item;
};

const combineStyles = (...styles) => {
  return function CombineStyles(theme) {
    const outStyles = styles.map((arg) => {
      // Apply the "theme" object for style functions.
      if (typeof arg === "function") {
        return arg(theme);
      }
      // Objects need no change.
      return arg;
    });

    return outStyles.reduce((acc, val) => Object.assign(acc, val));
  };
};

const getDisplay = (olabObject) => {
  if (olabObject.hasOwnProperty("visible")) {
    return olabObject.visible ? "" : "none";
  }
  return "inline";
};

const translateTypeToObject = (type) => {
  switch (type) {
    case "question":
      type = "questions";
      break;
    case "constant":
      type = "constants";
      break;
    case "counter":
      type = "counters";
      break;
    case "file":
      type = "files";
      break;
    default:
      break;
  }

  return type;
};

const translateLevelToObject = (level) => {
  switch (level) {
    case "Maps":
      level = "map";
      break;
    case "Nodes":
      level = "node";
      break;
    case "Servers":
      level = "server";
      break;
    default:
      break;
  }

  return level;
};

export {
  combineStyles,
  findWikiInList,
  getConstant,
  getCounter,
  getCounters,
  getDisplay,
  getFile,
  getQuestion,
  getScript,
  OlabAttendeeTag,
  OlabConstantTag,
  OlabCountersTag,
  OlabCounterTag,
  OlabLinksTag,
  OlabMediaResourceTag,
  OlabModeratorTag,
  OlabQuestionTag,
  OlabDragAndDropQuestion,
  OlabDropDownQuestion,
  OlabMultilineTextQuestion,
  OlabMultiPickQuestion,
  OlabSinglelineTextQuestion,
  OlabSinglePickQuestion,
  OlabSliderQuestion,
  OlabReportTag,
  OlabScriptTag,
  OlabSessionTag,
  translateLevelToObject,
  translateTypeToObject,
};
