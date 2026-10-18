// @flow
import React, { PureComponent } from "react";
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  FilterVintage as DefaultIcon,
  FilterVintageOutlined as DefaultOutlinedIcon,
} from "@material-ui/icons";

import {
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TablePagination,
  TextField,
  Typography,
} from "@material-ui/core";

import CircularSpinnerWithText from "../CircularSpinnerWithText/CircularSpinnerWithText";
import removeHTMLTags from "../../helpers/removeHTMLTags";
import styled from "styled-components";

import styles, { SearchWrapper, ListItemContentWrapper } from "./styles";

const MapListWrapper = styled.div`
  max-height: 75vh;
  overflow: auto;
  padding-right: 5px;
`;

class ListWithSearch extends PureComponent {
  static defaultProps = {
    getIcon: () => "",
    getIconTooltip: () => "",
    iconEven: DefaultIcon,
    iconOdd: DefaultOutlinedIcon,
    isForModal: false,
    isItemsDisabled: false,
    isWithSpinner: true,
    primarytext: (item) => item.name,
    secondarytext: (item) => item.description,
    showIcons: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      query: "",
      page: 0,
      rowsPerPage: 10,
    };
  }

  clearSearch = () => {
    const { onClear } = this.props;

    onClear();
    this.setState({ query: "", page: 0 });
  };

  onInputChange = (e) => {
    const { onSearch } = this.props;
    const { name, value } = (e.target: window.HTMLInputElement);

    onSearch(value);
    this.setState({ [name]: value, page: 0 });
  };

  onPageChange = (event, page) => {
    this.setState({ page });
  };

  onRowsPerPageChange = (event) => {
    this.setState({ rowsPerPage: Number(event.target.value), page: 0 });
  };

  render() {
    const { query, page, rowsPerPage } = this.state;
    const {
      classes,
      getIcon,
      // getIconTooltip,
      isForModal,
      isHideSearch,
      isItemsDisabled,
      isItemsFetching,
      isWithSpinner,
      label,
      list,
      primarytext,
      secondarytext,
      showIcons,
    } = this.props;

    const listClassNames = classNames(
      classes.list,
      { [classes.listLimits]: isForModal },
      { [classes.listEmpty]: isHideSearch },
    );

    const isShowSpinner = isWithSpinner && isItemsFetching;
    const lastPage = Math.max(0, Math.ceil(list.length / rowsPerPage) - 1);
    const currentPage = Math.min(page, lastPage);
    const pageItems = list.slice(
      currentPage * rowsPerPage,
      currentPage * rowsPerPage + rowsPerPage,
    );

    return (
      <div>
        {!isHideSearch && (
          <SearchWrapper>
            <TextField
              type="search"
              name="query"
              label={label}
              className={classes.searchField}
              value={query}
              onChange={this.onInputChange}
              fullWidth
            />

            {query.trim() ? (
              <IconButton
                aria-label="Clear Input"
                title="Clear Input"
                onClick={this.clearSearch}
                classes={{ root: classes.searchIcon }}
              >
                <CloseIcon />
              </IconButton>
            ) : (
              <SearchIcon classes={{ root: classes.searchIcon }} />
            )}
          </SearchWrapper>
        )}

        <MapListWrapper>
          <List classes={{ root: listClassNames }} disablePadding>
            {pageItems.map((listItem) => (
              <ListItem
                key={listItem.id}
                classes={{ root: classes.listItem }}
                disabled={isItemsDisabled}
              >
                <ListItemContentWrapper>
                  <div disabled={isItemsDisabled}>
                    <Grid container spacing={0}>
                      <Grid item xs={2} style={{ minWidth: "125px" }}>
                        {getIcon(showIcons, listItem)}
                      </Grid>
                      <Grid item xs={10}>
                        <ListItemText
                          primary={primarytext(listItem)}
                          secondary={removeHTMLTags(
                            secondarytext(listItem) || "",
                          )}
                          classes={{ secondary: classes.secondaryText }}
                        />
                      </Grid>
                    </Grid>
                  </div>
                </ListItemContentWrapper>
              </ListItem>
            ))}

            {!list.length && (
              <ListItem classes={{ root: classes.listItem }}>
                <Typography component={"span"} align="right" variant="caption">
                  Empty list...
                </Typography>
              </ListItem>
            )}
          </List>
        </MapListWrapper>

        <TablePagination
          component="div"
          count={list.length}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={this.onPageChange}
          onRowsPerPageChange={this.onRowsPerPageChange}
        />

        {isShowSpinner && (
          <CircularSpinnerWithText
            text="Updating list from the server..."
            centered
            large
          />
        )}
      </div>
    );
  }
}

export default withStyles(styles)(ListWithSearch);
