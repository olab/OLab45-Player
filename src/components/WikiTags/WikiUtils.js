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

    if (item == null) {
      log.error(`Could not find file '${name}'`);
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

    if (item == null) {
      log.error(`Could not find counter '${name}'`);
    }
  } catch (error) {
    log.error(`error looking up counter ${name}: ${error}`);
  }

  return item;
};

const getQuestion = (name, props) => {
  let question = null;

  try {
    const {
      props: {
        scopedObjects: { map, node, server },
      },
    } = props;

    question = findWikiInList(
      [...node?.questions, ...map?.questions, ...server?.questions],
      name
    );

    if (question.questionType !== 3 && question.questionType !== 2) {
      if (question.value === null) {
        question.value = 0;
      }
    } else {
      if (question.value === null) {
        question.value = "";
      }
    }

    if (question.width === 0) {
      question.width = 300;
    }

    if (question.name != null) {
      question.htmlIdBase = `QU:${question.name}`;
    } else {
      question.htmlIdBase = `QU:${question.id}`;
    }
  } catch (error) {
    log.error(`error looking up question ${name}: ${error}`);
  }

  return question;
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

    if (item == null) {
      log.error(`Could not find constant ${name}`);
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

export {
  combineStyles,
  findWikiInList,
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
};
