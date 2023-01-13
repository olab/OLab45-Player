import React from 'react';
import { Card } from './Card';
import log from 'loglevel';

class DragDropContainer extends React.Component {

  constructor(props) {

    super(props);
    this.state = {
      responses: this.props.responses,
      width: this.props.width
    };
  }

  moveCard = (dragIndex, hoverIndex) => {

    log.debug(`DragDropContainer swapping '${this.state.responses[dragIndex].response}' -> position ${hoverIndex + 1}`);

    this.setState(state => {
      const responses = state.responses;

      let temp = responses[hoverIndex];
      responses[hoverIndex] = responses[dragIndex];
      responses[dragIndex] = temp;

      return { responses };
    })

    // bubble the response order to the parent component
    if ( this.props.onChange ) {
      this.props.onChange(this.state.responses);
    }    
  };

  renderCard = (response, index) => {
    return (
    <Card 
      key={response.id} 
      index={index} 
      id={response.id} 
      text={response.response} 
      moveCard={this.moveCard} />);
  };

  render() {

    const { responses, width } = this.state;
    const style = {
      width: width,
    };

    return (<>
      <div style={style}>{responses.map((card, i) => this.renderCard(card, i))}</div>
    </>);
  }
}

export default DragDropContainer;