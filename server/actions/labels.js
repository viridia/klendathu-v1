const { ObjectId } = require('mongodb');
const logger = require('../common/logger');
const serializers = require('./serializers');

module.exports = function (app, apiRouter) {
  const projects = app.db.collection('projects');
  const labels = app.db.collection('labels');

  apiRouter.get('/labels', (req, res) => {
    if (!req.query.project) {
      res.status(400).json({ err: 'no-project' });
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
      const query = {
        project: req.query.project,
      };
      labels.find(query).sort({ name: 1 }).toArray((error, rows) => {
        if (error) {
          logger.error('Error fetching labels', error);
          return res.status(500).json({ err: 'internal', details: error });
        }
        return res.json({
          labels: rows.map(serializers.label),
        });
      });
    }
  });

  apiRouter.delete('/labels/:id', (req, res) => {
    // console.info(req.params);
    if (!req.user) {
      res.status(401).json({ err: 'unauthorized' });
    } else {
      labels.findOne({ _id: req.params.id }).then(label => {
        if (label) {
          // TODO: Ownership test.
          labels.deleteOne({ id: req.params.id }).then(() => {
            res.status(200).end();
          }, error => {
            logger.error('Error deleting label', req.params.id);
            res.status(500).json({ err: 'delete-error', details: error });
          });
        } else {
          logger.error('Error deleting non-existent label', req.params.id);
          res.status(404).json({ err: 'delete-nonexistent' });
        }
      }, err => {
        logger.error('Error finding label to delete', err);
        return res.status(500).json({ err: 'internal' });
      });
    }
  });

  apiRouter.put('/labels', (req, res) => {
    logger.info(req.body);
    if (!req.user) {
      res.status(401).json({ err: 'unauthorized' });
    } else {
      const { name, color, project } = req.body;
      if (name.length < 3) {
        // Name too short
        res.status(400).json({ err: 'too-short' });
        return;
      } else if (!color) {
        res.status(400).json({ err: 'no-color' });
        return;
      }
      projects.findOne({ _id: new ObjectId(project) }).then(proj => {
        // Check if project exists
        if (!proj) {
          res.status(400).json({ err: 'no-project' });
        } else {
          const now = new Date();
          const label = { project, name, creator: req.user._id, color, created: now, updated: now };
          labels.insertOne(label).then(row => {
            res.json(serializers.label(row.ops[0]));
            logger.info('Created label', name);
          }, error => {
            logger.error('Error creating label', error);
            return res.status(500).json({ err: 'internal' });
          });
        }
      }, err => {
        logger.error('Error finding project', err);
        return res.status(500).json({ err: 'internal' });
      });
    }
  });

  apiRouter.patch('/labels/:id', (req, res) => {
    if (!req.user) {
      res.status(401).json({ err: 'unauthorized' });
    } else {
      labels.findOne({ _id: req.params.id }).then(label => {
        if (label) {
          // TODO: Ownership test.
          const { name, color } = req.body;
          const updates = { name, color };
          projects.updateOne({ _id: req.params.id }, {
            $set: updates,
          }).then(() => {
            res.status(200).end();
          }, error => {
            logger.error('Error updating label', req.params.name);
            res.status(500).json({ err: 'update-error', details: error });
          });
        } else {
          logger.error('Error updating non-existent label', req.params.name);
          res.status(404).json({ err: 'no-label' });
        }
      }, err => {
        logger.error('Error finding label to update', err);
        return res.status(500).json({ err: 'internal' });
      });
    }
  });
};
