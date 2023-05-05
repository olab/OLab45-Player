// @flow
import React, { PureComponent } from "react";
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import {
  List,
  ListItem,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";

import styles, {
  SearchWrapper,
  ListItemContent,
  MapListWrapper,
} from "./styles";

class AssigneeSearchableList extends PureComponent {
  isMatchingQuery(item) {
    const { query = "" } = this.state || {};
    // basic case-insensitive string search
    const cleanup = (str) => str.toLowerCase().replace(/\s/g, "").trim();

    // empty query, return all
    if (0 == query.trim().length) return true;

    return -1 != cleanup(item.text).indexOf(cleanup(query));
  }

  render() {
    const { query = "" } = this.state || {};
    const { classes, list } = this.props;
    const listClassNames = classNames(classes.list);
    const filteredList = list.filter(this.isMatchingQuery.bind(this));

    return (
      <div id="AssigneeSearchableList">
        <TextField
          type="search"
          name="query"
          label={"Search by name"}
          className={classes.searchField}
          value={query}
          onChange={(e) => this.setState({ query: e.target.value })}
          fullWidth
        />

        <MapListWrapper>
          <List style={{ overflow: "hidden" }} disablePadding>
            {filteredList.map((listItem) => (
              <ListItem
                key={listItem.id}
                classes={{ root: classes.listItem }}
                onClick={(e) =>
                  void e.preventDefault() ||
                  this.props.onAtriumAssignClicked(listItem)
                }
              >
                <ListItemContent>
                  <span>{listItem.text}</span>
                  <Tooltip title="Assign" aria-label="add" placement="top">
                    <AddIcon />
                  </Tooltip>
                </ListItemContent>
              </ListItem>
            ))}

            {!filteredList.length && (
              <Typography component="span" align="left">
                {query.trim().length > 0
                  ? "No matches found..."
                  : "Waiting for learners..."}
              </Typography>
            )}
          </List>
        </MapListWrapper>
      </div>
    );
  }
}

export default withStyles(styles)(AssigneeSearchableList);
