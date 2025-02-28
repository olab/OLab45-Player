import React, { PureComponent } from "react";
import ReactDOM from "react-dom";
import { withStyles } from "@material-ui/core/styles";
import {
  Info as MapInfoIcon,
  PlayArrow as MapPlayIcon,
  PauseSharp as MapResumeIcon,
} from "@material-ui/icons";
import { ButtonGroup, Grid, Button, Tooltip } from "@material-ui/core";
import log from "loglevel";

import styles from "./styles";
import ListWithSearch from "../ListWithSearch/ListWithSearch";
import MapDetailDlg from "./MapDetailDlg/MapDetailDlg";
import styled from "styled-components";
import { PAGE_TITLES } from "../config";
import filterByName from "../../helpers/filterByName";
import filterByIndex from "../../helpers/filterByIndex";
import { getMap } from "../../services/api";
import Import from "../Import/Import";
import { getMaps } from "../../services/api";
import { config } from "../../config";

// const playerState = require("../../utils/PlayerState").PlayerState;
import { PlayerState } from "../../utils/PlayerState";
const playerState = new PlayerState();

const HomeWrapper = styled.div`
  padding: 1rem;
  width: 100%;
`;

class Home extends PureComponent {
  constructor(props) {
    super(props);

    const debug = PlayerState.GetDebug();

    const logLevel = PlayerState.GetLogLevel();
    log.setLevel(logLevel);

    log.debug(`${this.constructor["name"]} ctor`);

    this.state = {
      debug,
      error: null,
      isButtonsDisabled: false,
      isMapInfoFetched: false,
      isMapsFetching: true,
      mapDetails: {},
      mapId: null,
      mapInfoDlgOpen: false,
      maps: [],
      mapsFiltered: [],
      nodeId: null,
      sessionId: null,
    };

    log.debug(`${this.constructor["name"]} ${JSON.stringify(this.state)}`);

    this.listWithSearchRef = React.createRef();
    this.setPageTitle();

    if (!this.state.disableCache) {
      this.state.maps = PlayerState.GetMaps();
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

  onItemClicked = (scopeLevel) => {};

  onMapPlayClicked = (map, nodeId) => {
    this.setState({ mapId: map.id, nodeId: nodeId });

    const url = `${config.APP_BASEPATH}/${map.id}/${nodeId}`;
    log.debug(`map clicked. url ${url}`);

    window.location.href = url;
  };

  onMapInfoClicked = async (map) => {
    log.debug(`${this.constructor["name"]} onMapInfoClicked`);

    this.setState({ isMapInfoFetched: false });
    const { data } = await getMap(this.props, map.id);

    this.setState({
      mapInfoDlgOpen: true,
      isMapInfoFetched: true,
      mapDetails: data,
    });
  };

  onMapInfoClosed = () => {
    log.debug(`${this.constructor["name"]} onMapInfoClosed`);

    this.setState({
      mapInfoDlgOpen: false,
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

  onSearchClearClicked = () => {
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

    PlayerState.ClearMap();
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
                    this.onMapInfoClicked(scopedObject);
                  }}
                />
              </Button>
            </Tooltip>
            <Tooltip title="Play map">
              <Button>
                <MapPlayIcon
                  onClick={() => {
                    this.onMapPlayClicked(scopedObject, 0);
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
      isButtonsDisabled,
      isMapInfoFetched,
      isMapsFetching,
      mapDetails,
      mapInfoDlgOpen,
      maps,
      mapsFiltered,
    } = this.state;

    log.debug(`${this.constructor["name"]} render`);

    var isSuperUser = this.props.authActions.isSuperUser();

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
                onClear={this.onSearchClearClicked}
                onItemClick={this.onItemClicked}
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
          {isSuperUser && <Import props={this.props} />}
          {isMapInfoFetched && mapDetails && mapDetails.id !== null && (
            <MapDetailDlg
              open={mapInfoDlgOpen}
              close={this.onMapInfoClosed}
              data={mapDetails}
            />
          )}
        </HomeWrapper>
      </>
    );
  }
}

export default withStyles(styles)(Home);
