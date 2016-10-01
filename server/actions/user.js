const { ObjectId } = require('mongodb');
const logger = require('../common/logger');

module.exports = function (app, apiRouter) {
  const users = app.db.collection('users');

  apiRouter.get('/user/:id', (req, res) => {
    return users.findOne({ _id: new ObjectId(req.params.id) }).then(user => {
      if (user) {
        return res.json({
          id: user._id,
          username: user.username,
          fullname: user.fullname,
          photo: user.photo,
        });
      }
      return res.status(404).end();
    }, error => {
      logger.error('Error fetching projects', error);
      return res.status(500).json({ err: 'internal', details: error });
    });
  });
};
