const logger = require('../common/logger');
const serializers = require('./serializers');

module.exports = function (app, apiRouter) {
  const projects = app.db.collection('projects');

  apiRouter.get('/projects', (req, res) => {
    if (!req.user) {
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
      projects.find({
        owningUser: req.user._id,
      }).sort({ created: -1 }).toArray((error, rows) => {
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

  apiRouter.delete('/projects/:name', (req, res) => {
    // console.info(req.params);
    if (!req.user) {
      res.status(401).json({ err: 'unauthorized' });
    } else {
      projects.findOne({ name: req.params.name }).then(proj => {
        if (proj) {
          // TODO: Ownership test.
          projects.deleteOne({ name: req.params.name }).then(() => {
            res.status(200).end();
          }, error => {
            logger.error('Error deleting project', req.params.name);
            res.status(500).json({ err: 'delete-error', details: error });
          });
        } else {
          logger.error('Error deleting non-existent project', req.params.name);
          res.status(404).json({ err: 'delete-nonexistent' });
        }
      }, err => {
        logger.error('Error finding project to delete', err);
        return res.status(500).json({ err: 'internal' });
      });
    }
  });

  apiRouter.put('/projects', (req, res) => {
    if (!req.user) {
      res.status(401).json({ err: 'unauthorized' });
    } else {
      const { name, owner } = req.body;
      if (name.length < 6) {
        // Name too short
        res.status(400).json({ err: 'too-short' });
        return;
      } else if (!name.match(/^[a-z0-9\-]+$/)) {
        // Special characters not allowed
        res.status(400).json({ err: 'invalid-name' });
        return;
      }
      projects.findOne({ name }).then(proj => {
        // Check if project exists
        if (proj) {
          res.status(400).json({ err: 'exists' });
        } else {
          const now = new Date();
          const project = { name, description: '', title: '', created: now, updated: now };
          if (owner === '') {
            project.owningUser = req.user._id;
            project.owningOrg = null;
          } else {
            res.status(400).json({ err: 'unimplemented', details: 'custom owners not supported' });
            return;
          }

          projects.insertOne(project).then(() => {
            res.json({ created: name });
            logger.info('Created project', name);
          }, error => {
            logger.error('Error creating project', error);
            return res.status(500).json({ err: 'internal' });
          });
        }
      }, err => {
        logger.error('Error creating project', err);
        return res.status(500).json({ err: 'internal' });
      });
    }
  });

  apiRouter.patch('/projects/:name', (req, res) => {
    if (!req.user) {
      res.status(401).json({ err: 'unauthorized' });
    } else {
      projects.findOne({ name: req.params.name }).then(proj => {
        if (proj) {
          // TODO: Ownership test.
          const { description } = req.body;
          const updates = { description };
          projects.updateOne({ name: req.params.name }, {
            $set: updates,
          }).then(() => {
            res.status(200).end();
          }, error => {
            logger.error('Error updating project', req.params.name);
            res.status(500).json({ err: 'project-update-error', details: error });
          });
        } else {
          logger.error('Error updating non-existent project', req.params.name);
          res.status(404).json({ err: 'no-project' });
        }
      }, err => {
        logger.error('Error finding project to update', err);
        return res.status(500).json({ err: 'internal' });
      });
    }
  });
};
