const { ObjectId } = require('mongodb');
const escapeRegExp = require('../lib/escapeRegExp');

function serialize(user) {
  const { _id, username, fullname, photo, verified } = user;
  return { id: _id, username, fullname, photo, verified };
}

const resolverMethods = {
  singleUser({ id }) {
    return this.db.collection('users').findOne({ _id: new ObjectId(id) }).then(user => {
      if (!user) {
        return null;
      }
      return serialize(user);
    });
  },

  users({ id, token }) {
    const query = {};
    if (id) {
      query._id = new ObjectId(id);
    }
    if (token) {
      const pattern = `\\b${escapeRegExp(token)}`;
      query.fullname = { $regex: pattern, $options: 'i' };
    }
    return this.db.collection('users').find(query).sort({ fullname: 1 }).toArray()
    .then(users => users.map(serialize));
  },
};

module.exports = function (rootClass) {
  Object.assign(rootClass.prototype, resolverMethods);
};
