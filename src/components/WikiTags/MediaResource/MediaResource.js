// @flow
import React from 'react';
import log from 'loglevel';

import styles from '../styles.module.css';
import siteStyles from '../site.module.css';
import { getFile } from '../WikiTags';
import { getDownload } from '../../../services/api';
const persistantStorage = require('../../../utils/StateStorage').PersistantStateStorage;

class OlabMediaResourceTag extends React.Component {

  constructor(props) {

    super(props);

    const debug = persistantStorage.get( null, 'debug');
    this.state = {
      ...debug
    };

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

    const {
      name
    } = this.props;

    log.debug(`OlabMediaResourceTag render '${name}'`);

    try {

      let item = getFile(name, this.props);

      if (item != null) {

        log.debug(`file object: '${JSON.stringify(item, null, 2)}'`);

        const url = `${process.env.PUBLIC_URL}/static/files/${item.scopeLevel}/${item.parentId}/${item.path}`;
        log.debug(`file url: '${url}'`);

        let sizeProps = {};

        if ( item.height !== 0 ) {
          sizeProps.height = item.height;
        }
        if ( item.width !== 0 ) {
          sizeProps.width = item.width;
        }
        
        if (!this.state.enableWikiRendering) {
          return (
            <>
              <b>[[MR:{name}]] "{item.scopeLevel}/{item.parentId}/{item.path}"</b>
            </>
          );
        }

        if (this.isAudioType(item.mime)) {
          return (
            <div className={`${styles['mraudio']} ${siteStyles[item.id]}`} id={`${item.id}`}>
              <audio alt={item.path} type={item.mime} autoPlay="autoplay" autobuffer="" controls>
                <source src={url} />
              </audio>
            </div>
          );
        }

        else if (this.isImageType(item.mime)) {          
          return (
            <div className={`${styles['mrimage']} ${siteStyles[item.id]}`} id={`${item.id}`}>
              <img {...sizeProps} alt={item.path} src={url} />
            </div>
          );
        }

        else if (this.isVideoType(item.mime)) {
          return (
            <div className={`${styles['mrvideo']} ${siteStyles[item.id]}`} id={`${item.id}`}>
              <video controls>
                <source type={item.mime} src={url} />
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
                <a id={`file-link-${item.id}`} download={item.path} href={url}>{item.path}</a>
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
