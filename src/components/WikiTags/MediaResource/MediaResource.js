// @flow
import React from "react";

import styles from "../styles.module.css";
import siteStyles from "../site.module.css";
import { getFile } from "../WikiUtils";
import { getDownload } from "../../../services/api";
import log from "loglevel";
import BrokenImageIcon from "@material-ui/icons/BrokenImage";
import { Tooltip } from "@material-ui/core";

// const playerState = require("../../../utils/PlayerState").PlayerState;
import { PlayerState } from "../../../utils/PlayerState";
const playerState = new PlayerState();

import OlabTag from "../OlabTag";

class OlabMediaResourceTag extends OlabTag {
  constructor(props) {
    let olabObject = getFile(props.name, props);
    super(props, olabObject);
  }

  downloadFile(item) {
    try {
      getDownload(this.props.props, item);
    } catch (error) {
      LogError(`Unable to download file ${item.id}`);
    }
  }

  isAudioType(mimeType) {
    return mimeType.indexOf("audio/") !== -1;
  }

  isImageType(mimeType) {
    return mimeType.indexOf("image/") !== -1;
  }

  isVideoType(mimeType) {
    return mimeType.indexOf("video/") !== -1;
  }

  render() {
    const { debug, olabObject } = this.state;
    const { id, name } = this.props;

    log.debug(`${this.constructor["name"]} render`);

    try {
      if (!olabObject) {
        const toolTip = `Unknown MR: '${name}'`;
        return (
          <Tooltip placement="top" title={toolTip}>
            <BrokenImageIcon color="error" fontSize="large" />
          </Tooltip>
        );
      }

      let sizeProps = {};

      if (olabObject.height !== 0) {
        sizeProps.height = olabObject.height;
      }
      if (olabObject.width !== 0) {
        sizeProps.width = olabObject.width;
      }

      if (debug.disableWikiRendering) {
        return (
          <>
            <b>
              [[{id}]] ({olabObject.id}) "{olabObject.path}"
            </b>
          </>
        );
      }

      if (!olabObject.originUrl) {
        const toolTip = `${olabObject.scopeLevel}(${olabObject.parentid}): '${olabObject.name}'`;
        return (
          <Tooltip placement="top" title={toolTip}>
            <BrokenImageIcon color="error" fontSize="large" />
          </Tooltip>
        );
      }

      // handle case if file store is not on same host as website
      if ( olabObject.hostName != null ) {
        olabObject.originUrl = `${olabObject.hostName}${olabObject.originUrl}`;
      }

      if (this.isAudioType(olabObject.mime)) {
        return (
          <div
            className={`${styles["mraudio"]} ${siteStyles[olabObject.id]}`}
            id={`${olabObject.id}`}
          >
            <audio
              alt={olabObject.fileName}
              type={olabObject.mime}
              autoPlay="autoplay"
              autobuffer=""
              controls
            >
              <source src={olabObject.originUrl} />
            </audio>
          </div>
        );
      } else if (this.isImageType(olabObject.mime)) {
        return (
          <div
            className={`${styles["mrimage"]} ${siteStyles[olabObject.id]}`}
            id={`${olabObject.id}`}
          >
            <img
              {...sizeProps}
              alt={olabObject.fileName}
              src={olabObject.originUrl}
            />
          </div>
        );
      } else if (this.isVideoType(olabObject.mime)) {
        return (
          <div
            className={`${styles["mrvideo"]} ${siteStyles[olabObject.id]}`}
            id={`${olabObject.id}`}
          >
            <video controls>
              <source type={olabObject.mime} src={olabObject.originUrl} />
            </video>
          </div>
        );
      } else {
        return (
          <>
            <div>
              <a
                id={`${id}`}
                download={olabObject.fileName}
                href={olabObject.originUrl}
              >
                {olabObject.fileName}
              </a>
            </div>
          </>
        );
      }
    } catch (error) {
      return this.errorJsx(id, error);
    }
  }
}

export default OlabMediaResourceTag;
