// @flow
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FormLabel } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import log from "loglevel";
import JsxParser from "react-jsx-parser";

import styles from "../../styles.module.css";
import siteStyles from "../../site.module.css";

import { getQuestion } from "../../WikiTags";
import { postQuestionValue } from "../../../../services/api";
const playerState = require("../../../../utils/PlayerState").PlayerState;

class OlabDragAndDropQuestion extends React.Component {
  constructor(props) {
    super(props);

    log.debug(`${this.constructor["name"]} ctor`);

    let question = getQuestion(this.props.name, this.props);
    const debug = playerState.GetDebug();

    this.state = {
      debug,
      question,
      ...props.props,
    };

    this.grid = 8;

    // Binding this keyword
    this.setInProgress = this.setInProgress.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  setInProgress(inProgress) {
    this.setState({ showProgressSpinner: inProgress });
    log.debug(`set progress spinner: ${inProgress}`);
  }

  setValue = (responses) => {
    const question = this.state.question;
    log.debug(`responses`);

    let values = [];

    for (const iterator of responses) {
      log.debug(` ${iterator.response}(${iterator.id})`);
      values.push(iterator.id);
    }

    if (typeof question.previousValue == "undefined") {
      question.previousValue = null;
    } else {
      question.previousValue = question.value;
    }

    question.value = values.join(",");

    log.debug(
      `OlabSinglePickQuestion set question '${question.id}' value = '${question.value}'.`
    );

    question.responses = responses;

    this.setState({ question });
    this.transmitResponse();
  };

  transmitResponse() {
    const { onSubmitResponse, authActions, map, node, contextId } =
      this.props.props;

    let responseState = {
      ...this.state,
      authActions,
      map,
      node,
      contextId,
      setIsDisabled: this.setIsDisabled,
      setInProgress: this.setInProgress,
    };

    this.onSubmitResponse(responseState);
  }

  // a little function to help us with reordering the result
  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    border: "1px solid gray",
    padding: "0.5rem 1rem",
    marginBottom: ".5rem",
    backgroundColor: "white",
    cursor: "move",

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  getListStyle = (isDraggingOver) => ({
    background: "lightgrey",
    padding: this.grid,
    width: this.state.question.width ? this.state.question.width : 450,
  });

  onDragEnd(result) {
    var { question } = this.state;

    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const responses = this.reorder(
      this.state.question.responses,
      result.source.index,
      result.destination.index
    );

    this.setValue(responses);
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    const { debug, question } = this.state;
    const { id, name } = this.props;

    log.debug(`${this.constructor["name"]} render`);

    try {
      if (debug.disableWikiRendering) {
        return (
          <>
            <b>
              [[{id}]] ({question.id})
            </b>
          </>
        );
      }

      return (
        <div
          className={`${styles["qudraganddrop"]} ${siteStyles[id]}`}
          id={`${id}`}
        >
          <FormLabel id={`${id}::stem`} component="legend">
            <JsxParser jsx={question.stem} />
          </FormLabel>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={this.getListStyle()}
                >
                  {question.responses.map((item, index) => (
                    <Draggable
                      id={`${id}::QR:${item.id}`}
                      key={item.id}
                      draggableId={item.name}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={this.getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          {item.response}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      );
    } catch (error) {
      return (
        <>
          <b>
            [[{id}]] error "{error.message}"
          </b>
        </>
      );
    }
  }

  onSubmitResponse = async (newState) => {
    // send question response to server and get the
    // new dynamic objects state
    var { data } = await postQuestionValue(newState);

    // bubble up the dynamic object to player since the
    // dynamic objects may be shared to other components
    if (data != null && this.props.props.onUpdateDynamicObjects) {
      this.props.props.onUpdateDynamicObjects(data);
      this.setInProgress(false);
    }
  };
}

export default withStyles(styles)(OlabDragAndDropQuestion);
