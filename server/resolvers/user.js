const escapeRegExp = require('../lib/escapeRegExp');

function serialize(user) {
  const { _id, username, fullname, photo, verified } = user;
  return { id: _id, username, fullname, photo, verified };
}

const resolverMethods = {
  singleUser({ username }) {
    return this.db.collection('users').findOne({ username }).then(user => {
      if (!user) {
        return null;
      }
      return serialize(user);
    });
  },

  users({ token }) {
    const query = {};
    if (token) {
      const pattern = `\\b${escapeRegExp(token)}`;
      query.$or = [
        { fullname: { $regex: pattern, $options: 'i' } },
        { username: { $regex: pattern, $options: 'i' } },
      ];
    }
    return this.db.collection('users').find(query).sort({ fullname: 1 }).toArray()
    .then(users => users.map(serialize));
  },
};

module.exports = function (rootClass) {
  Object.assign(rootClass.prototype, resolverMethods);
};
