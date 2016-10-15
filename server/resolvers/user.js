const { ObjectId } = require('mongodb');
const escapeRegExp = require('../lib/escapeRegExp');

function serialize(user) {
  const { _id, username, fullname, photo, verified } = user;
  return { id: _id, username, fullname, photo, verified };
}

module.exports = {
  user({ id }, { db }) {
    return db.collection('users').findOne({ _id: new ObjectId(id) }).then(user => {
      if (!user) {
        return null;
      }
      return serialize(user);
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
    .then(users => users.map(serialize));
  },
};
