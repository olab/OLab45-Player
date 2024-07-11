import React, { PureComponent } from "react";
import { withStyles } from "@material-ui/core/styles";
import styles from "../styles";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import log from "loglevel";

class ImpersonateDlg extends PureComponent {
  constructor(props) {
    super(props);

    log.debug(`${this.constructor["name"]} ctor`);

    this.state = {
      open: this.props.open,
      data: this.props.data,
    };
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { open, data } = this.state;

    log.debug(`${this.constructor["name"]} render`);

    return (
      <div>
        <Dialog
          open={open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{data.name}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <b>User to Impersonate:&nbsp;</b>
              {data.userName}
              <br />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary" autoFocus>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(ImpersonateDlg);
