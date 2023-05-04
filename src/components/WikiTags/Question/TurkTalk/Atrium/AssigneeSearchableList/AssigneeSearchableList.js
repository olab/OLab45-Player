// @flow
import React, { PureComponent } from "react";
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import {
  List,
  ListItem,
  TextField,
  Typography,
} from "@material-ui/core";

import styles, { SearchWrapper, ListItemContent, MapListWrapper } from "./styles";

class AssigneeSearchableList extends PureComponent {
  isMatchingQuery(item) {
    const { query='' } = this.state || {};
    // basic case-insensitive string search
    const cleanup = (str) => str.toLowerCase().replace(/\s/g, '').trim()

    // empty query, return all
    if ( 0 == query.trim().length )
      return true

    return -1 != cleanup(item.text).indexOf(cleanup(query))
  }

  render() {
    const { query='' } = this.state || {};
    const { classes, list } = this.props;
    const listClassNames = classNames(classes.list);
    const filteredList = list.filter(this.isMatchingQuery.bind(this))

    return (
      <div>
        <SearchWrapper>
          <TextField
            type="search"
            name="query"
            label={'Search for learners by name'}
            className={classes.searchField}
            value={query}
            onChange={(e) => this.setState({ query: e.target.value })}
            fullWidth
          />
        </SearchWrapper>

        <MapListWrapper>
          <List classes={{ root: listClassNames }} disablePadding>
            {filteredList.map((listItem) => (
              <ListItem
                key={listItem.id}
                classes={{ root: classes.listItem }}
                onClick={e => void e.preventDefault() || this.props.selectItem(listItem)}
              >
                <ListItemContent>
                  <span>{listItem.text}</span>
                  <small>Assign</small>
                </ListItemContent>
              </ListItem>
            ))}

            {!filteredList.length && (
              <ListItem classes={{ root: classes.emptyListItem }}>
                <Typography component="span" align="right" variant="caption">
                  {query.trim().length > 0 ? 'No matches found...' : 'Waiting for participants...'}
                </Typography>
              </ListItem>
            )}
          </List>
        </MapListWrapper>
      </div>
    );
  }
}

export default withStyles(styles)(AssigneeSearchableList);
