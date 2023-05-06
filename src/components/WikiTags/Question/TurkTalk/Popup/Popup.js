// @flow
import * as React from "react";
import MuiAlert from "@material-ui/lab/Alert";

import { Snackbar } from "@material-ui/core";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class Popup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: props?.args?.open ? props.args.open : null,
      message: props?.args?.message ? props.args.message : null,
      level: props?.args?.level ? props.args.level : "info",
      duration: props?.args?.duration ? props.args.duration : 3000,
    };
  }

  handleInfoClose(event, reason) {
    if (reason === "clickaway") {
      return;
    }

    this.setState({ open: false, message: null });
  }

  render() {
    const { open, message, level, duration } = this.state;

    if (open === true && message != null) {
      return (
        <Snackbar
          open={open}
          autoHideDuration={duration}
          onClose={this.handleInfoClose}
        >
          <Alert onClose={this.handleInfoClose} severity={level}>
            {message}
          </Alert>
        </Snackbar>
      );
    } else {
      return <></>;
    }
  }
}

export default Popup;
