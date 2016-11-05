import React, { PropTypes } from 'react';
import FileIcon from './fileIcon.jsx';

/** React component that represents a list of attachments to an issue. */
export default class ShowAttachments extends React.Component {
  renderFile(attachment) {
    return (
      <div className="issue-attachment" key={attachment.id} title={attachment.filename}>
        <a href={attachment.url} className="icon" target="_blank" rel="noopener noreferrer">
          <FileIcon
              type={attachment.type}
              filename={attachment.filename}
              url={attachment.url}
              thumbnail={attachment.thumb} />
        </a>
        <div className="name">{attachment.filename}</div>
      </div>
    );
  }

  render() {
    return (
      <div className="attachments">
        {this.props.attachments.map(a => this.renderFile(a))}
      </div>
    );
  }
}

ShowAttachments.propTypes = {
  attachments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      filename: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
};
