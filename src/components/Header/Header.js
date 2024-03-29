// @flow
import React from "react";
import { Link } from "react-router-dom";
import { LinearProgress, Button } from "@material-ui/core";
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

const Header = ({ version, authActions, isScreenBusy, externalPlay }) => {
  const [logoutDialogOpen, toggleLogoutDialogOpen] = React.useReducer(
    (state) => !state,
    false
  );

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
              <VersionWrapper>
                User: {authActions.getUserName()}
                <br />
                Version: {version}
              </VersionWrapper>
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
          {/* {!authActions && (
            <VersionWrapper>
              User: anonymous
              <br />
              Version: {version}
            </VersionWrapper>
          )} */}
        </div>
        {isScreenBusy ? <LinearProgress /> : <FakeProgress />}
      </HeaderWrapper>

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
