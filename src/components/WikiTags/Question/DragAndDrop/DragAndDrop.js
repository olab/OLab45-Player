// @flow
import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FormLabel } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import log from "loglevel";
import JsxParser from "react-jsx-parser";

import styles from "../../styles.module.css";
import siteStyles from "../../site.module.css";

import { getQuestion } from "../../WikiUtils";
import OlabTag from "../../OlabTag";

class OlabDragAndDropQuestion extends OlabTag {
  constructor(props) {
    let olabObject = getQuestion(props.name, props);
    super(props, olabObject);

    this.grid = 8;

    this.onDragEnd = this.onDragEnd.bind(this);
  }

  setValue = (responses) => {
    const { debug, olabObject } = this.state;
    log.debug(`responses`);

    let values = [];

    for (const iterator of responses) {
      log.debug(` ${iterator.response}(${iterator.id})`);
      values.push(iterator.id);
    }

    if (typeof olabObject.previousValue == "undefined") {
      olabObject.previousValue = null;
    } else {
      olabObject.previousValue = olabObject.value;
    }

    olabObject.value = values.join(",");

    log.debug(
      `OlabSinglePickQuestion set question '${olabObject.id}' value = '${olabObject.value}'.`
    );

    olabObject.responses = responses;

    this.setState({ olabObject });
    this.transmitResponse();
  };

  transmitResponse() {
    const { authActions, map, node, contextId } = this.props.props;

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
    width: this.state.olabObject.width ? this.state.olabObject.width : 450,
  });

  onDragEnd(result) {
    var { question } = this.state;

    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const responses = this.reorder(
      this.state.olabObject.responses,
      result.source.index,
      result.destination.index
    );

    this.setValue(responses);
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    const { debug, olabObject } = this.state;
    const { id, name } = this.props;

    log.debug(`${this.constructor["name"]} render`);

    try {
      if (debug.disableWikiRendering) {
        return (
          <>
            <b>
              [[{id}]] ({olabObject.id})
            </b>
          </>
        );
      }

      return (
        <div
          className={`${styles["qudraganddrop"]} ${siteStyles[id]}`}
          id={olabObject.htmlIdBase}
          olabid={olabObject.id}
        >
          <FormLabel id={`${olabObject.htmlIdBase}::stem`} component="legend">
            <JsxParser jsx={olabObject.stem} />
          </FormLabel>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={this.getListStyle()}
                >
                  {olabObject.responses.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.name}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          id={`QR:${item.id}`}
                          parentid={olabObject.htmlIdBase}
                          name={item.name}
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
      return this.errorJsx(id, error);
    }
  }
}

export default withStyles(styles)(OlabDragAndDropQuestion);
