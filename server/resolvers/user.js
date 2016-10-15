const { ObjectId } = require('mongodb');
const escapeRegExp = require('../lib/escapeRegExp');

module.exports = {
  users({ id, token }) {
    const query = {};
    if (id) {
      query._id = new ObjectId(id);
    }
    if (token) {
      const pattern = `\\b${escapeRegExp(token)}`;
      query.name = { $regex: pattern, $options: 'i' };
    }
    return this.db.collection('users').find(query).sort({ username: 1 }).toArray()
    .then(users => {
      return users.map(user => {
        const { _id, username, fullname, photo, verified } = user;
        return { id: _id, username, fullname, photo, verified };
      });
    });
  },
};
