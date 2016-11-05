import React, { PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import Immutable from 'immutable';
import classNames from 'classnames';
import axios from 'axios';
import CloseIcon from 'icons/ic_close_black_24px.svg';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
import FileIcon from './fileIcon.jsx';
import './attachments.scss';

const fileTarget = {
  // drop(props, monitor) {
  // },
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
}

/** Data object representing a file to upload. This mainly exists so that we can keep the
    browser File object and it's associated progress callback together in once place. */
class UploadableFile {
  constructor(file) {
    this.file = file;
    this.progress = 0;
    this.id = null;
    this.url = null;
    this.thumbnail = null;
  }

  get filename() {
    return this.file.name;
  }

  get type() {
    return this.file.type;
  }

  /** Begin uploading the file, returns a promise. */
  upload(onProgress) {
    const formData = new FormData();
    formData.append('attachment', this.file);
    return axios.post('file', formData, {
      onUploadProgress: onProgress,
    }).then(resp => {
      this.id = resp.data.id;
      this.url = resp.data.url;
      this.thumbnail = resp.data.thumb;
      return resp.data;
    }, error => {
      console.error('post file error:', error);
      return null;
    });
  }
}

/** Data object representing a file that was previously uploaded. */
class UploadedFile {
  constructor({ filename, type, url, thumb, id }) {
    this.filename = filename;
    this.type = type;
    this.id = id;
    this.url = url;
    this.thumbnail = thumb;
  }
}

/** React component that renders a single attachment to be uploaded. */
class AttachmentPreview extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.onProgress = this.onProgress.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.state = {
      progress: 0,
      loaded: !!props.attachment.url,
    };
  }

  componentDidMount() {
    if (!this.props.attachment.url) {
      this.props.attachment.upload(this.onProgress).then(data => {
        if (data) {
          this.setState({ loaded: true });
        }
      });
    }
  }

  onProgress(value) {
    this.setState({ progress: (value.loaded * 100) / value.total });
  }

  onRemove(e) {
    e.preventDefault();
    this.props.onRemove(this.props.attachment);
  }

  render() {
    const { type, filename, url, thumbnail } = this.props.attachment;
    return (
      <div
          className={classNames('issue-attachment', { loaded: this.state.loaded })}
          title={filename}>
        <div className="icon">
          <button className="close" onClick={this.onRemove}><CloseIcon /></button>
          <FileIcon type={type} filename={filename} url={url} thumbnail={thumbnail} />
        </div>
        <div className="name">{filename}</div>
        <ProgressBar striped bsStyle="success" now={this.state.progress} />
      </div>
    );
  }
}

AttachmentPreview.propTypes = {
  attachment: PropTypes.shape({
    type: PropTypes.string.isRequired,
    filename: PropTypes.string.isRequired,
    url: PropTypes.string,
    thumbnail: PropTypes.string,
    upload: PropTypes.func,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
};

class FileDropZone extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.onFileChange = this.onFileChange.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  onDrop(e) {
    this.addFiles(e.dataTransfer.files);
  }

  onFileChange() {
    this.addFiles(this.fileInput.files);
    this.fileInput.value = '';
  }

  addFiles(fileList) {
    let files = this.props.files;
    for (const f of fileList) {
      const attachment = new UploadableFile(f);
      files = files.set(attachment.filename, attachment);
    }
    this.props.onChangeFiles(files);
  }

  render() {
    const { connectDropTarget, isOver, canDrop } = this.props;
    return connectDropTarget(
      <label
          onDrop={this.onDrop}
          htmlFor="upload"
          className={classNames('file-drop-zone', { over: isOver, canDrop })}>
        {this.props.files.size === 0 && <span>Drop files here to upload (or click)</span>}
        <input
            type="file"
            id="upload"
            multiple
            style={{ display: 'none' }}
            onChange={this.onFileChange}
            ref={el => { this.fileInput = el; }} />
      </label>
    );
  }
}

FileDropZone.propTypes = {
  files: PropTypes.shape({
    size: PropTypes.number.isRequired,
  }).isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool,
  canDrop: PropTypes.bool,
  onChangeFiles: PropTypes.func.isRequired,
};

const FileDropZoneDnD = DropTarget(NativeTypes.FILE, fileTarget, collect)(FileDropZone); // eslint-disable-line

/** React component that represents a list of attachments to be uploaded. */
export default class UploadAttachments extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.onChangeFiles = this.onChangeFiles.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.state = {
      files: Immutable.OrderedMap.of(),
    };
  }

  onRemove(attachment) {
    this.setState({ files: this.state.files.remove(attachment.filename) });
  }

  onChangeFiles(files) {
    this.setState({ files });
  }

  setFiles(fileList) {
    let files = this.state.files;
    for (const f of fileList) {
      const attachment = new UploadedFile(f);
      files = files.set(attachment.filename, attachment);
    }
    this.setState({ files });
  }

  files() {
    return this.state.files.toArray().filter(f => f.url !== null).map(f => f.id);
  }

  renderFiles() {
    const { files } = this.state;
    return files.toArray().map(attachment => (<AttachmentPreview
        key={attachment.filename} attachment={attachment} onRemove={this.onRemove} />));
  }

  render() {
    return (
      <div className="upload-attachments" ref={el => { this.form = el; }}>
        <div className="files">
          {this.renderFiles()}
        </div>
        <FileDropZoneDnD files={this.state.files} onChangeFiles={this.onChangeFiles} />
      </div>
    );
  }
}

UploadAttachments.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    workflow: PropTypes.shape({}),
    template: PropTypes.shape({}),
  }).isRequired,
};

UploadAttachments.contextTypes = {
  profile: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }),
};
