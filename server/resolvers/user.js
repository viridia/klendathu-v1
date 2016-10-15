const { ObjectId } = require('mongodb');
const escapeRegExp = require('../lib/escapeRegExp');
const logger = require('../common/logger');

module.exports = {
  user({ id }, { db }) {
    return db.collection('users').findOne({ _id: new ObjectId(id) }).then(user => {
      if (!user) {
        return null;
      }
      const { _id, username, fullname, photo, verified } = user;
      return { id: _id, username, fullname, photo, verified };
    });
  },

  users({ id, token }, { db }) {
    const query = {};
    if (id) {
      query._id = new ObjectId(id);
    }
    if (token) {
      const pattern = `\\b${escapeRegExp(token)}`;
      query.fullname = { $regex: pattern, $options: 'i' };
    }
    return db.collection('users').find(query).sort({ fullname: 1 }).toArray()
    .then(users => {
      return users.map(user => {
        const { _id, username, fullname, photo, verified } = user;
        return { id: _id, username, fullname, photo, verified };
      });
    });
  },
};
