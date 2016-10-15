const { ObjectId } = require('mongodb');
const logger = require('../common/logger');
const pick = require('../lib/pick');

function serialize(project) {
  const { _id, name, title, description, owningUser, owningOrg, created, updated } = project;
  return { id: _id, name, title, description, owningUser, owningOrg, created, updated };
}

module.exports = {
  project({ id, name: pname }, { db }) {
    const query = {};
    if (id) {
      query._id = new ObjectId(id);
    }
    if (pname) {
      query.name = pname;
    }
    return db.collection('projects').findOne(query).then(project => {
      if (!project) {
        return null;
      }
      return serialize(project);
    });
  },

  projects({ id, name: pname }, { db }) {
    const query = {};
    if (id) {
      query._id = new ObjectId(id);
    }
    if (pname) {
      query.name = pname;
    }
    return db.collection('projects').find(query).sort({ created: -1 }).toArray()
    .then(projects => {
      return projects.map(serialize);
    });
  },

  update(args) {
    if (!this.user) {
      return Promise.reject(401);
    }
    const id = new ObjectId(args.id);
    const projects = this.db.collection('projects');
    return projects.findOne({ _id: id }).then(proj => {
      if (proj) {
        // TODO: Ownership test.
        const updates = pick(args, ['title', 'description']);
        return projects.updateOne({ _id: id }, {
          $set: updates,
        }).then(() => {
          return projects.findOne({ _id: id }).then(project => {
            return serialize(project);
          });
        }, error => {
          logger.error('Error updating project', id, proj.name, error);
          return Promise.reject(500);
        });
      } else {
        logger.error('Error updating non-existent project', id);
        return Promise.reject(404);
      }
    }, err => {
      logger.error('Error finding project to update', err);
      return Promise.reject(500);
    });
  },
};
