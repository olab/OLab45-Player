import log from 'loglevel';

const findWikiInList = (list, wiki) => {

  const match = {};

  for (let element of list) {
    if ((element.name === wiki) || (element.id === Number(wiki))) {
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

      var nodeCounterAction = 
        counterActions.find( action => ( action.nodeId == nodeId ) && ( action.counterId == mapCounter.id ) );
      
      if ( typeof nodeCounterAction !== "undefined" ) {
        if ( nodeCounterAction.display !== 1 ) {
          continue;
        }        
      }

      items.push(mapCounter);

    }

  } catch (error) {
    log.error(`error looking up counters: ${error}`)
  }

  return items;
};

const getFile = (name, props) => {

  let item = null;

  try {

    const {
      props: {
        scopedObjects: { map, node, server }
      },
    } = props;

    const array = [
      ...node?.files,
      ...map?.files,
      ...server?.files,
    ];

    item = findWikiInList(array, name);

    if (item == null) {
      log.error(`Could not find file '${name}'`);
    }

  } catch (error) {
    log.error(`error looking up file ${name}: ${error}`)
  }

  return item;
};

const getCounter = (name, dynamicObjects) => {

  let item = null;

  try {

    const {
        map, node, server
    } = dynamicObjects;

    item = findWikiInList([
      ...node?.counters,
      ...map?.counters,
      ...server?.counters,
    ], name);

    if (item == null) {
      log.error(`Could not find counter '${name}'`);
    }

  } catch (error) {
    log.error(`error looking up constant ${name}: ${error}`)
  }

  return item;
};

const getQuestion = (name, props) => {

  let question = null;

  try {

    const {
      props: {
        scopedObjects: { map, node, server }
      },
    } = props;

    question = findWikiInList([
      ...node?.questions,
      ...map?.questions,
      ...server?.questions,
    ], name);

    if (question == null) {
      log.error(`Could not find question ${name}`);
    }

  } catch (error) {
    log.error(`error looking up constant ${name}: ${error}`)
  }

  // question.previousValue = null;
  // question.previousResponseId = null;
  // question.value = null;
  // question.responseId = null;

  return question;
};

const getConstant = (name, props) => {

  let item = null;

  try {

    const {
      props: {
        scopedObjects: { map, node, server }
      },
    } = props;

    item = findWikiInList([
      ...node?.constants,
      ...map?.constants,
      ...server?.constants,
    ], name);

    if (item == null) {
      log.error(`Could not find constant ${name}`);
    }

  } catch (error) {
    log.error(`error looking up constant ${name}: ${error}`)
  }

  return item;
};

const combineStyles = (...styles) => {

  return function CombineStyles(theme) {
    const outStyles = styles.map((arg) => {
      // Apply the "theme" object for style functions.
      if (typeof arg === 'function') {
        return arg(theme);
      }
      // Objects need no change.
      return arg;
    });

    return outStyles.reduce((acc, val) => Object.assign(acc, val));
  };
};

export {
  findWikiInList,
  getConstant,
  getQuestion,
  getCounter,
  getCounters,
  getFile,
  combineStyles,
};
