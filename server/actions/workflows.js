const logger = require('../common/logger');
const serializers = require('./serializers');
const fs = require('fs');
const path = require('path');

module.exports = function (app, apiRouter) {
  const workflows = app.db.collection('workflows');
  apiRouter.get('/workflows/:project/:name', (req, res) => {
    if (req.params.project === 'std') {
      // Handle built-in workflows
      const wfPath = path.resolve(__dirname, `../workflows/${req.params.name}.json`);
      // logger.info(wfPath);
      fs.readFile(wfPath, 'utf8', (err, data) => {
        if (err) {
          logger.error('Error reading workflow file:', JSON.stringify(err));
          if (err.code === 'ENOENT') {
            res.status(404).end();
          } else {
            res.status(500).end();
          }
        } else {
          res.json({ workflow: JSON.parse(data) });
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
      workflows.find({ owningUser: req.user._id, name: req.params.name }).toArray((error, rows) => {
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

  // apiRouter.put('/workflows', (req, res) => {
  //   if (!req.user) {
  //     res.status(401).json({ err: 'unauthorized' });
  //   } else {
  //     const { name, owner } = req.body;
  //     if (name.length < 6) {
  //       // Name too short
  //       res.status(400).json({ err: 'too-short' });
  //       return;
  //     } else if (!name.match(/^[a-z0-9\-]+$/)) {
  //       // Special characters not allowed
  //       res.status(400).json({ err: 'invalid-name' });
  //       return;
  //     }
  //     workflows.findOne({ name }).then(proj => {
  //       // Check if project exists
  //       if (proj) {
  //         res.status(400).json({ err: 'exists' });
  //       } else {
  //         const now = new Date();
  //         const project = { name, description: '', title: '', created: now, updated: now };
  //         if (owner === '') {
  //           project.owningUser = req.user._id;
  //           project.owningOrg = null;
  //         }
  //
  //         workflows.insertOne(project).then(() => {
  //           res.json({ created: name });
  //           logger.info('Created project', name);
  //         }, error => {
  //           logger.error('Error creating project', error);
  //           return res.status(500).json({ err: 'internal' });
  //         });
  //       }
  //     }, err => {
  //       logger.error('Error creating project', err);
  //       return res.status(500).json({ err: 'internal' });
  //     });
  //   }
  // });
};
