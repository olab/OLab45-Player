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
import { ScopedObject } from "../../utils/ScopedObject";
import { DynamicObject } from "../../utils/DynamicObject";

const getCounters = (nodeId, props) => {
  let items = [];

  try {
    const {
      props: { scopedObject, dynamicObject },
    } = props;

    let mapCounters = dynamicObject.getCounters(nodeId, props);
    let counterActions = scopedObject.getMap().counterActions
      ? scopedObject.getMap().counterActions
      : [];

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
      props: { scopedObject },
    } = props;

    item = scopedObject.getObject(ScopedObject.FILES, name);

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

const getCounter = (name, props) => {
  let item = null;

  try {
    const {
      props: { dynamicObject },
    } = props;

    item = dynamicObject.getCounter(name);

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
      props: { scopedObject },
    } = props;

    item = scopedObject.getObject(ScopedObject.QUESTIONS, name);

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
      props: { scopedObject },
    } = props;

    item = scopedObject.getObject(ScopedObject.CONSTANTS, name);

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
      props: { scopedObject },
    } = props;

    item = scopedObject.getObject(ScopedObject.SCRIPTS, name);

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

// const translateTypeToObject = (type) => {
//   switch (type) {
//     case "question":
//       type = "questions";
//       break;
//     case "constant":
//       type = "constants";
//       break;
//     case "counter":
//       type = "counters";
//       break;
//     case "file":
//       type = "files";
//       break;
//     default:
//       break;
//   }

//   return type;
// };

// const translateLevelToObject = (level) => {
//   switch (level) {
//     case "Maps":
//       level = "map";
//       break;
//     case "Nodes":
//       level = "node";
//       break;
//     case "Servers":
//       level = "server";
//       break;
//     default:
//       break;
//   }

//   return level;
// };

export {
  combineStyles,
  getConstant,
  getCounter,
  getCounters,
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
  // translateLevelToObject,
  // translateTypeToObject,
};
