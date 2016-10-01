const logger = require('../common/logger');

module.exports = function (app, apiRouter) {
  apiRouter.get('/issues', (req, res) => {
    logger.log(req.user);
    res.json({ issues: [] });
  });
};
