import React, { PropTypes } from 'react';
import './attachments.scss';

/** React component that renders an icon for a file attachment. */
export default function FileIcon({ filename, url, thumbnail, type }) {
  switch (type) {
    case 'image/png':
    case 'image/gif':
    case 'image/jpeg':
      if (thumbnail) {
        return <img className="image thumb" src={thumbnail} alt={filename} />;
      } else if (url) {
        return <img className="image" src={url} alt={filename} />;
      }
      return <div className="image nothumb" />;
    case 'image/svg+xml':
      // TODO: This doesn't work.
      if (url) {
        return <img className="image svg" href={this.state.url} alt={filename} />;
      }
      return <div className="image nothumb" />;
    case 'text/plain':
    case 'application/rtf':
    case 'application/msword':
      return <div className="doc" />;
    case 'application/x-gzip':
    case 'application/java-archive':
    case 'application/x-tar':
    case 'application/zip':
    case 'application/x-compressed-zip':
      return <div className="archive" />;
    default:
      return <div className="generic" />;
  }
}

FileIcon.propTypes = {
  type: PropTypes.string.isRequired,
  filename: PropTypes.string.isRequired,
  url: PropTypes.string,
  thumbnail: PropTypes.string,
};
