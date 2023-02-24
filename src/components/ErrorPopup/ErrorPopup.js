import React from "react";
import { Snackbar } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class ErrorPopup extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { errorMessage, openErrorBox, onErrorDismissed } = this.props.props;

    if (openErrorBox) {
      return (
        <Snackbar
          open={openErrorBox}
          autoHideDuration={5000}
          onClose={onErrorDismissed}
        >
          <Alert onClose={onErrorDismissed} severity="error">
            {errorMessage}
          </Alert>
        </Snackbar>
      );
    }

    return <></>;
  }
}

export default ErrorPopup;
