// @flow
import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText
} from '@material-ui/core';
import log from 'loglevel';
import { getCounters } from '../WikiTags';
import styles from '../styles.module.css';
import siteStyles from '../site.module.css';

const persistantStorage = require('../../../utils/StateStorage').PersistantStateStorage;

class OlabCountersTag extends React.Component {

  constructor(props) {

    super(props);
    this.state = {
      id: props.props.id,
      name: props.props.name,
      question: props.props.question,
      authActions: props.props.authActions,
      onSubmitResponse: props.props.onSubmitResponse,
      showProgressSpinner: false,
      disabled: false,
      map: props.props.map,
      node: props.props.node,
      counterActions: props.props.scopedObjects.map.counteractions
    };
  }

  render() {

    log.debug(`OlabCountersTag render`);

    try {
      const {
        counterActions,
        node
      } = this.state;

      let counters = getCounters(
        node.id,
        this.props.props.dynamicObjects.map.counters,
        counterActions
      );

      if (persistantStorage.get('dbg-disableWikiRendering')) {
        return (
          <>
            <b>[[COUNTERS]]</b>
            <Box width="300px;">
              {counters.map((counter) => (
                <p>&nbsp;<b>[[CR:{counter.name}]]: {counter.value}</b></p>
              ))}
            </Box>
          </>
        );
      }

      if (counters.length === 0) {
        return (
          <div className={`${styles['counters']} ${siteStyles['counters']}`}>
            <Box width="300px;">
              <List component="span" dense={true}>
                {counters.map((counter) => (
                  <ListItem>
                    <ListItemText
                      primary={`${counter.name}: ${counter.value}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </div>
        );
      }

      return ( <></> );

    } catch (error) {

      log.error(`OlabMediaResourceTag render error: ${error}`);
      return (
        <>
          <b>[[COUNTERS]] "{error.message}"</b>
        </>
      );
    }
  }
}

export default OlabCountersTag;
