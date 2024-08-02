import React, { PureComponent } from "react";
import { withStyles } from "@material-ui/core/styles";
import styles from "../styles";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import JsxParser from "react-jsx-parser";
import log from "loglevel";

class MapDetailDlg extends PureComponent {
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
    this.props.close();
  };

  render() {
    const { open, data } = this.state;

    log.debug(
      `${this.constructor["name"]} render ${JSON.stringify(this.state)}`
    );

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
              <b>Id:&nbsp;</b>
              {data.id}
              <br />
              <b>Author:&nbsp;</b>
              {data.author}
              <br />
              <b>Nodes:&nbsp;</b>
              {data.nodeCount}
              <br />
              <b>Links:&nbsp;</b>
              {data.nodeLinkCount}
              <br />
              <b>Created:&nbsp;</b>
              {data.createdAt}
              <br />
              <b>Abstract:&nbsp;</b>
              <JsxParser jsx={data.abstract} />
              <b>Groups:&nbsp;</b>
              {data.groups.join(", ")}
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

export default withStyles(styles)(MapDetailDlg);
