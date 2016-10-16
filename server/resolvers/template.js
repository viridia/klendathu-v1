const logger = require('../common/logger');
const fs = require('fs');
const path = require('path');

const resolverMethods = {
  template({ project, name }) {
    if (project === 'std') {
      // Handle built-in templates
      return new Promise((resolve, reject) => {
        const filePath = path.resolve(__dirname, `../templates/${name}.json`);
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            logger.error('Error reading template file:', JSON.stringify(err));
            if (err.code === 'ENOENT') {
              reject(404);
            } else {
              reject(500);
            }
          } else {
            resolve(JSON.parse(data));
          }
        });
      });
    } else if (!this.user) {
      return Promise.reject(401);
    } else {
      // TODO: Query projects that user is a member of and user's orgs are members of
      // const userProjects = req.user.projects || [];
      // const userOrgs = req.user.organizations || [];
      // const query = {
      //   $or: [
      //     { owningUser: req.user._id, },
      //   ]
      // }
      return this.db.collection('templates').find({ owningUser: this.user._id, name })
      .toArray(rows => {
        // if (error) {
        //   logger.error('Error fetching projects', error);
        //   return res.status(500).json({ err: 'internal', details: error });
        // }
        return rows;
        // return res.json({
        //   projects: rows.map(serializers.project),
        // });
      });
    }
  },
};

module.exports = function (rootClass) {
  Object.assign(rootClass.prototype, resolverMethods);
};
