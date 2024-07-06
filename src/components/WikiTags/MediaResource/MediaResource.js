// @flow
import React from "react";

import styles from "../styles.module.css";
import siteStyles from "../site.module.css";
import { getFile } from "../WikiTags";
import { getDownload } from "../../../services/api";
import log from "loglevel";
import BrokenImageIcon from "@material-ui/icons/BrokenImage";
import { Tooltip } from "@material-ui/core";
const playerState = require("../../../utils/PlayerState").PlayerState;

class OlabMediaResourceTag extends React.Component {
  constructor(props) {
    super(props);

    log.debug(`${this.constructor["name"]} ctor`);

    let file = getFile(this.props.name, this.props);
    const debug = playerState.GetDebug();

    this.state = {
      debug,
      file,
      ...props.props,
    };
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
    const { debug, file } = this.state;
    const { id, name } = this.props;

    log.debug(`${this.constructor["name"]} render`);

    try {
      let item = file;

      if (!item) {
        const toolTip = `Unknown MR: '${name}'`;
        return (
          <Tooltip placement="top" title={toolTip}>
            <BrokenImageIcon color="error" fontSize="large" />
          </Tooltip>
        );
      }

      let sizeProps = {};

      if (item.height !== 0) {
        sizeProps.height = item.height;
      }
      if (item.width !== 0) {
        sizeProps.width = item.width;
      }

      if (debug.disableWikiRendering) {
        return (
          <>
            <b>
              [[{id}]] ({file.id}) "{item.path}"
            </b>
          </>
        );
      }

      if (!item.originUrl) {
        const toolTip = `${item.scopeLevel}(${item.parentId}): '${item.name}'`;
        return (
          <Tooltip placement="top" title={toolTip}>
            <BrokenImageIcon color="error" fontSize="large" />
          </Tooltip>
        );
      }

      if (this.isAudioType(item.mime)) {
        return (
          <div
            className={`${styles["mraudio"]} ${siteStyles[item.id]}`}
            id={`${item.id}`}
          >
            <audio
              alt={item.fileName}
              type={item.mime}
              autoPlay="autoplay"
              autobuffer=""
              controls
            >
              <source src={item.originUrl} />
            </audio>
          </div>
        );
      } else if (this.isImageType(item.mime)) {
        return (
          <div
            className={`${styles["mrimage"]} ${siteStyles[item.id]}`}
            id={`${item.id}`}
          >
            <img {...sizeProps} alt={item.fileName} src={item.originUrl} />
          </div>
        );
      } else if (this.isVideoType(item.mime)) {
        return (
          <div
            className={`${styles["mrvideo"]} ${siteStyles[item.id]}`}
            id={`${item.id}`}
          >
            <video controls>
              <source type={item.mime} src={item.originUrl} />
            </video>
          </div>
        );
      } else {
        return (
          <>
            <div>
              <a id={`${id}`} download={item.fileName} href={item.originUrl}>
                {item.fileName}
              </a>
            </div>
          </>
        );
      }
    } catch (error) {
      return (
        <>
          <b>
            [[{id}]] "{error.message}"
          </b>
        </>
      );
    }
  }
}

export default OlabMediaResourceTag;
