import { Log, LogInfo, LogError } from "../../utils/Logger";
import ErrorPopup from "../ErrorPopup/ErrorPopup";
import OlabAttendeeTag from "./Question/TurkTalk/Turkee/Turkee";
import OlabConstantTag from "./Constant/Constant";
import OlabCountersTag from "./Counters/Counter";
import OlabCounterTag from "./Counter/Counter";
import OlabLinksTag from "./Links/Links";
import OlabMediaResourceTag from "./MediaResource/MediaResource";
import OlabModeratorTag from "./Question/TurkTalk/Turker/Turker";
import OlabQuestionTag from "./Question/Question";
import OlabReportTag from "./Report/Report";
import OlabScriptTag from "./Script/Script";
import OlabSessionTag from "./Session/Session";
import log from "loglevel";

const findWikiInList = (list, wiki) => {
  const match = {};

  for (let element of list) {
    if (element.name === wiki || element.id === Number(wiki)) {
      match.item = element;
      break;
    }
  }

  return match.item;
};

const getCounters = (nodeId, mapCounters, counterActions) => {
  let items = [];

  try {
    for (const mapCounter of mapCounters) {
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
    LogError(`error looking up counters: ${error}`);
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
      LogError(`Could not find file '${name}'`);
    }
  } catch (error) {
    LogError(`error looking up file ${name}: ${error}`);
  }

  return item;
};

const getCounter = (name, dynamicObjects) => {
  let item = null;

  try {
    const { map, node, server } = dynamicObjects;

    item = findWikiInList(
      [...node?.counters, ...map?.counters, ...server?.counters],
      name
    );

    if (item == null) {
      LogError(`Could not find counter '${name}'`);
    }
  } catch (error) {
    LogError(`error looking up counter ${name}: ${error}`);
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

    if (question == null) {
      LogError(`Could not find question ${name}`);
    }
  } catch (error) {
    LogError(`error looking up question ${name}: ${error}`);
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
      LogError(`Could not find constant ${name}`);
    }
  } catch (error) {
    LogError(`error looking up constant ${name}: ${error}`);
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
      LogError(`Could not find script '${name}'`);
    }
  } catch (error) {
    LogError(`error looking up script ${name}: ${error}`);
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
  OlabReportTag,
  OlabScriptTag,
  OlabSessionTag,
};
