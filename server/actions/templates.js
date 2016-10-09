const logger = require('../common/logger');
const serializers = require('./serializers');
const fs = require('fs');
const path = require('path');

module.exports = function (app, apiRouter) {
  const templates = app.db.collection('templates');
  apiRouter.get('/templates/:project/:name', (req, res) => {
    if (req.params.project === 'std') {
      // Handle built-in templates
      const wfPath = path.resolve(__dirname, `../templates/${req.params.name}.json`);
      // logger.info(wfPath);
      fs.readFile(wfPath, 'utf8', (err, data) => {
        if (err) {
          logger.error('Error reading template file:', JSON.stringify(err));
          if (err.code === 'ENOENT') {
            res.status(404).end();
          } else {
            res.status(500).end();
          }
        } else {
          res.json({ template: JSON.parse(data) });
        }
      });
    } else if (!req.user) {
      res.status(401).json({ err: 'unauthorized' });
    } else {
      // TODO: Query projects that user is a member of and user's orgs are members of
      // const userProjects = req.user.projects || [];
      // const userOrgs = req.user.organizations || [];
      // const query = {
      //   $or: [
      //     { owningUser: req.user._id, },
      //   ]
      // }
      templates.find({ owningUser: req.user._id, name: req.params.name }).toArray((error, rows) => {
        if (error) {
          logger.error('Error fetching projects', error);
          return res.status(500).json({ err: 'internal', details: error });
        }
        return res.json({
          projects: rows.map(serializers.project),
        });
      });
    }
  });
};
