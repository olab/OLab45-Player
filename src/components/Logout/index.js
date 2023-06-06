import React, { useEffect } from "react";
import log from "loglevel";

export default (props) =>
{
  useEffect(() =>
  {
    try {
      props.authActions?.clearState();
    } catch(err) {
      log.error('logout authActions.clearState() error', err.stack);
    }

    location.assign(process.env.PUBLIC_URL + '/');
  }, []);

  return <></>;
}
