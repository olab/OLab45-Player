// @flow
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LinearProgress,
  Button,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import { ReactComponent as LogoIcon } from "../../shared/assets/icons/olab4_logo.svg";
import {
  Logo,
  HeaderWrapper,
  FakeProgress,
  CenterPlaceholder,
  VersionWrapper,
} from "./styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import log from "loglevel";
import { impersonateUserAsync } from "../../services/api";
var constants = require("../../services/constants");

const Header = ({
  version,
  authActions,
  isScreenBusy,
  externalPlay,
  setCredentials,
}) => {
  const [userName, setUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showError, toggleShowError] = React.useReducer(
    (state) => !state,
    false
  );

  const [inProgress, toggleInProgress] = React.useReducer(
    (state) => !state,
    false
  );

  const [logoutDialogOpen, toggleLogoutDialogOpen] = React.useReducer(
    (state) => !state,
    false
  );
  const [impersonateDialogOpen, toggleImpersonateDialogOpen] = React.useReducer(
    (state) => !state,
    false
  );

  const isSuperUser = authActions.isSuperUser();

  const userNameChanged = (event) => {
    setUserName(event.target.value);
  };

  const onUserNameClicked = (event) => {
    log.debug(`Header onUserNameClicked`);
    toggleImpersonateDialogOpen();
  };

  const onUserOkClicked = async (event) => {
    log.debug(`Header onUserOkClicked`);

    toggleInProgress();
    if (showError) toggleShowError();

    try {
      const token = authActions.getToken();

      // clean up any spaces
      setUserName(userName.replace(/\s/g, ""));

      const data = await impersonateUserAsync({
        username: userName,
        token: token,
      });

      if (!data) {
        throw new Error("Unable to impersonate");
      }

      if (data.error_code == 401) {
        throw new Error("Unauthorized/Invalid User");
      } else {
        if (data.data.authInfo) {
          setCredentials(data.data, userName, constants.TOKEN_TYPE_NATIVE);
        } else {
          throw JSON.stringify(data, null, 2);
        }
      }

      setUserName("");
      toggleImpersonateDialogOpen();
    } catch (error) {
      log.error(`error: ${JSON.stringify(error, null, 2)})`);
      setErrorMessage(error.message);
      toggleShowError();
    }

    toggleInProgress();
  };

  return (
    <>
      <HeaderWrapper>
        <div>
          <Link to={`${process.env.PUBLIC_URL}/`} className="route-link">
            <Logo>
              <LogoIcon />
              <h1>OLab4</h1>
            </Logo>
          </Link>
          <CenterPlaceholder>&nbsp;</CenterPlaceholder>
          {authActions && (
            <>
              {isSuperUser && (
                <VersionWrapper>
                  User: &nbsp;
                  <a
                    style={{ textDecoration: "underline" }}
                    onClick={onUserNameClicked}
                  >
                    {authActions.getUserName()}
                  </a>
                  <br />
                  Version: {version}
                </VersionWrapper>
              )}

              {!isSuperUser && (
                <VersionWrapper>
                  User: {authActions.getUserName()}
                  <br />
                  Version: {version}
                </VersionWrapper>
              )}

              <Button
                variant="outlined"
                color="primary"
                size="large"
                aria-label="Return to Home"
                onClick={() =>
                  externalPlay ? toggleLogoutDialogOpen() : authActions.logout()
                }
              >
                &nbsp;Logout&nbsp;
              </Button>
            </>
          )}
        </div>
        {isScreenBusy ? <LinearProgress /> : <FakeProgress />}
      </HeaderWrapper>

      <Dialog
        open={impersonateDialogOpen}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Impersonate User</DialogTitle>
        {!inProgress && (
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <TextField
                id="user"
                label="User"
                value={userName}
                onChange={userNameChanged}
              />
            </DialogContentText>
          </DialogContent>
        )}

        {showError && (
          <center>
            <b>{errorMessage}</b>
          </center>
        )}

        {inProgress && (
          <center>
            <CircularProgress color="inherit" />
          </center>
        )}

        <DialogActions>
          <Button onClick={() => onUserOkClicked()} color="secondary">
            OK
          </Button>
          <Button onClick={() => toggleImpersonateDialogOpen()} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={logoutDialogOpen}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to sign out?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Any progress you have made may be discarded.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => toggleLogoutDialogOpen()}
            color="primary"
            autoFocus
          >
            Cancel
          </Button>
          <Button
            onClick={() => (toggleLogoutDialogOpen(), authActions.logout())}
            color="secondary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
