const { ObjectId } = require('mongodb');
const mongo = require('mongodb');
const Grid = require('gridfs-stream');
const logger = require('../common/logger');
const { InternalError } = require('../common/errors');

const resolverMethods = {
  attachmentsById({ idList }) {
    const gfs = Grid(this.db, mongo); // eslint-disable-line
    const oidList = idList.map(id => new ObjectId(id));
    return gfs.files.find({ _id: { $in: oidList } }).toArray()
    .then(results => {
      // Make sure result map is in the same order
      const resultMap = new Map(results.map(r => [r._id.toString(), r]));
      return idList.map(id => {
        const record = resultMap.get(id);
        const url = `/api/file/${record._id}/${record.filename}`;
        const thumb = record.metadata && record.metadata.thumb &&
          `/api/file/${record.metadata.thumb}/${record.filename}`;
        return {
          filename: record.filename,
          id: record._id,
          type: record.contentType,
          url,
          thumb,
        };
      });
    }, error => {
      logger.error('Error retrieving attachments', idList, error);
      return Promise.reject(new InternalError());
    });
  },
};

module.exports = function (rootClass) {
  Object.assign(rootClass.prototype, resolverMethods);
};
