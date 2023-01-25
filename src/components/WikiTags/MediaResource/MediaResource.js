// @flow
import React from 'react';
import log from 'loglevel';

import styles from '../styles.module.css';
import siteStyles from '../site.module.css';
import { getFile } from '../WikiTags';
import { getDownload } from '../../../services/api';
const playerState = require('../../../utils/PlayerState').PlayerState;
import BrokenImageIcon from '@material-ui/icons/BrokenImage';
import { Tooltip } from '@material-ui/core';

class OlabMediaResourceTag extends React.Component {

  constructor(props) {

    super(props);

    const debug = playerState.GetDebug();
    this.state = { debug };

  }

  downloadFile(item) {
    try {
      getDownload(this.props.props, item);
    } catch (error) {
      log.error(`Unable to download file ${item.id}`);
    }
  }

  isAudioType(mimeType) {
    return (mimeType.indexOf("audio/") !== -1);
  }

  isImageType(mimeType) {
    return (mimeType.indexOf("image/") !== -1);
  }

  isVideoType(mimeType) {
    return (mimeType.indexOf("video/") !== -1);
  }

  render() {

    const { debug } = this.state;

    const {
      name
    } = this.props;

    log.debug(`OlabMediaResourceTag render '${name}'`);

    try {

      let item = getFile(name, this.props);

      if (item != null) {

        log.debug(`file object: '${JSON.stringify(item, null, 2)}'`);

        let sizeProps = {};

        if (item.height !== 0) {
          sizeProps.height = item.height;
        }
        if (item.width !== 0) {
          sizeProps.width = item.width;
        }

        if (!debug.enableWikiRendering) {
          return (
            <>
              <b>[[MR:{name}]] "{item.path}"</b>
            </>
          );
        }

        if (!item.path) {
          return (
            <Tooltip placement="top" title={item.name}>
              <BrokenImageIcon color="error" fontSize="large" />
            </Tooltip>);
        }

        if (this.isAudioType(item.mime)) {
          return (
            <div className={`${styles['mraudio']} ${siteStyles[item.id]}`} id={`${item.id}`}>
              <audio alt={item.fileName} type={item.mime} autoPlay="autoplay" autobuffer="" controls>
                <source src={item.path} />
              </audio>
            </div>
          );
        }

        else if (this.isImageType(item.mime)) {
          return (
            <div className={`${styles['mrimage']} ${siteStyles[item.id]}`} id={`${item.id}`}>
              <img {...sizeProps} alt={item.fileName} src={item.path} />
            </div>
          );
        }

        else if (this.isVideoType(item.mime)) {
          return (
            <div className={`${styles['mrvideo']} ${siteStyles[item.id]}`} id={`${item.id}`}>
              <video controls>
                <source type={item.mime} src={item.path} />
              </video>
            </div>
          );
        }

        // else if (item.isEmbedded === 1) {

        //   // handle special case of PDF file
        //   if (item.mime === "application/pdf") {
        //     return (
        //       <embed src={url} width="500" height="375" type='application/pdf' />
        //     );
        //   }
        // }

        else {
          return (
            <>
              <div>
                <a id={`file-link-${item.id}`} download={item.path} href={item.path}>{item.fileName}</a>
              </div>
            </>
          );
        }
      }

    } catch (error) {

      log.error(`OlabMediaResourceTag render error: ${JSON.stringify(error, null, 2)}`);
      return (
        <>
          <b>[[MR:{name}]] "{error.message}"</b>
        </>
      );
    }
  }
}

export default OlabMediaResourceTag;
