const { ObjectId } = require('mongodb');
const logger = require('../common/logger');
const serializers = require('./serializers');

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

module.exports = function (app, apiRouter) {
  const users = app.db.collection('users');

  apiRouter.get('/user/:id', (req, res) => {
    return users.findOne({ _id: new ObjectId(req.params.id) }).then(user => {
      if (user) {
        return res.json(serializers.userInfo(user));
      }
      return res.status(404).end();
    }, error => {
      logger.error('Error fetching user', error);
      return res.status(500).json({ err: 'internal', details: error });
    });
  });

  apiRouter.get('/user', (req, res) => {
    const { project, token } = req.query;
    const pattern = `^${escapeRegExp(token)}`;
    return users.find({
      username: { $regex: pattern, $options: 'i' },
    }).limit(10).sort({ username: 1 }).toArray((error, rows) => {
      if (error) {
        logger.error('Error fetching users', error);
        return res.status(500).json({ err: 'internal', details: error });
      }
      console.log(project, token, rows);
      return res.json({ users: rows.map(serializers.userInfo) });
    });
  });
};
