import React, { useEffect } from "react";
import log from "loglevel";

export default (props) => {
  useEffect(() => {
    try {
      props.authActions?.clearState();
    } catch (err) {
      log.error("logout authActions.clearState() error", err.stack);
    }

    log.debug(`logging out to URL ${import.meta.env.BASE_URL}`);
    location.assign(import.meta.env.BASE_URL);
  }, []);

  return <></>;
};
