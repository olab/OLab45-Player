import React, { PureComponent } from "react";
import ReactDOM from "react-dom";
import { withStyles } from "@material-ui/core/styles";
import {
  Info as MapInfoIcon,
  PlayArrow as MapPlayIcon,
  PauseSharp as MapResumeIcon,
} from "@material-ui/icons";
import { ButtonGroup, Grid, Button, Tooltip } from "@material-ui/core";
import { Log, LogInfo, LogError } from "../../utils/Logger";
import log from "loglevel";

import styles from "./styles";
import ListWithSearch from "../ListWithSearch/ListWithSearch";
import MapDetail from "./MapDetail/MapDetail";
import styled from "styled-components";
import { PAGE_TITLES } from "../config";
import filterByName from "../../helpers/filterByName";
import filterByIndex from "../../helpers/filterByIndex";
import { getMap } from "../../services/api";
import Import from "../Import/Import";
import { getMaps } from "../../services/api";
import { config } from "../../config";

const playerState = require("../../utils/PlayerState").PlayerState;

const HomeWrapper = styled.div`
  padding: 1rem;
  width: 100%;
`;

class Home extends PureComponent {
  constructor(props) {
    super(props);

    const debug = playerState.GetDebug();

    this.state = {
      error: null,
      mapId: null,
      nodeId: null,
      maps: [],
      mapsFiltered: [],
      mapDetails: {},
      isButtonsDisabled: false,
      isMapsFetching: true,
      isMapInfoFetched: false,
      sessionId: null,
      debug,
    };

    this.listWithSearchRef = React.createRef();
    this.setPageTitle();

    if (!this.state.disableCache) {
      this.state.maps = playerState.GetMaps();
      this.state.mapsFiltered = this.state.maps;
    }

    console.log(JSON.stringify(config));
  }

  setPageTitle = () => {
    document.title = PAGE_TITLES.HOME;
  };

  toggleDisableButtons = () => {
    this.setState(({ isButtonsDisabled }) => ({
      isButtonsDisabled: !isButtonsDisabled,
    }));
  };

  handleMapItemClick = (scopeLevel) => {};

  handleMapPlayClick = (map, nodeId) => {
    this.setState({ mapId: map.id, nodeId: nodeId });

    const url = `${config.APP_BASEPATH}/${map.id}/${nodeId}`;
    log.debug(`map clicked. url ${url}`);

    window.location.href = url;
  };

  handleMapInfoClick = async (map) => {
    this.setState({ isMapInfoFetched: false });
    const { data } = await getMap(this.props, map.id);

    this.setState({
      mapInfoOpen: true,
      isMapInfoFetched: true,
      mapDetails: data,
    });
  };

  mapInfoHandleClose = () => {
    this.setState({
      mapInfoOpen: false,
    });
  };

  handleMapResumeClick = (map) => {};

  handleItemsSearch = (query) => {
    const { maps } = this.state;
    const scopedObjectsNameFiltered = filterByName(maps, query);
    const scopedObjectsIndexFiltered = filterByIndex(maps, query);
    const mapsFiltered = [
      ...scopedObjectsNameFiltered,
      ...scopedObjectsIndexFiltered,
    ];

    this.setState({ mapsFiltered });
  };

  clearSearchInput = () => {
    const { maps: mapsFiltered } = this.state;
    this.setState({ mapsFiltered });
  };

  componentDidUpdate(prevProps) {
    const { mapId, maps, history, isMapDetailsFetching } = this.props;
    const { maps: mapsPrev, isMapDetailsFetching: isMapDetailsFetchingPrev } =
      prevProps;

    const isFetchingStopped = isMapDetailsFetchingPrev && !isMapDetailsFetching;
    const isMapRetrieved = isFetchingStopped && mapId;

    if (isFetchingStopped) {
      this.toggleDisableButtons();
    }

    if (maps !== mapsPrev) {
      const { query } = this.listWithSearchRef.state;
      const mapsFiltered = filterByName(maps, query);

      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ mapsFiltered });
    }

    if (isMapRetrieved) {
      history.push(`/${mapId}`, { isFromHome: true });
    }
  }

  async componentDidMount() {
    const { data: objData } = await getMaps(this.props);

    this.setState({
      isMapsFetching: false,
      maps: objData,
      mapsFiltered: objData,
    });

    playerState.ClearMap();
  }

  getIcon = (showIcons, scopedObject) => {
    if (showIcons && scopedObject.id) {
      return (
        <div style={{ marginTop: "10px" }}>
          <ButtonGroup
            size="small"
            color="primary"
            aria-label="small outlined button group"
          >
            <Tooltip title="Get map info">
              <Button>
                <MapInfoIcon
                  onClick={() => {
                    this.handleMapInfoClick(scopedObject);
                  }}
                />
              </Button>
            </Tooltip>
            <Tooltip title="Play map">
              <Button>
                <MapPlayIcon
                  onClick={() => {
                    this.handleMapPlayClick(scopedObject, 0);
                  }}
                />
              </Button>
            </Tooltip>
            <Tooltip title="Resume map">
              <Button>
                <MapResumeIcon
                  onClick={() => {
                    this.handleMapResumeClick(scopedObject);
                  }}
                />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </div>
      );
    }
    return "";
  };

  render() {
    const {
      maps,
      mapsFiltered,
      isMapsFetching,
      isButtonsDisabled,
      mapDetails,
      isMapInfoFetched,
      mapInfoOpen,
    } = this.state;

    var role = this.props.authActions.getRole();

    return (
      <>
        <h2>Home</h2>
        <HomeWrapper>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ListWithSearch
                getIcon={this.getIcon}
                innerRef={this.setListWithSearchRef}
                isItemsDisabled={isButtonsDisabled}
                isItemsFetching={isMapsFetching}
                label="Search for map by keyword or index"
                list={mapsFiltered}
                onClear={this.clearSearchInput}
                onItemClick={this.handleMapItemClick}
                onSearch={this.handleItemsSearch}
                isWithSpinner={this.isMapsFetching}
              />
              <br />
              Showing&nbsp;
              {mapsFiltered.length}
              &nbsp;of&nbsp;
              {maps.length}
              &nbsp;maps.
            </Grid>
          </Grid>
          {role === "olab:superuser" && <Import props={this.props} />}
          {isMapInfoFetched && mapDetails && mapDetails.id !== null && (
            <MapDetail
              open={mapInfoOpen}
              onClose={this.mapInfoHandleClose}
              data={mapDetails}
            />
          )}
          ;
        </HomeWrapper>
      </>
    );
  }
}

export default withStyles(styles)(Home);
