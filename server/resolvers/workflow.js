const logger = require('../common/logger');
const fs = require('fs');
const path = require('path');

const resolverMethods = {
  workflow({ project, name }) {
    if (project === 'std') {
      // Handle built-in workflows
      return new Promise((resolve, reject) => {
        const filePath = path.resolve(__dirname, `../workflows/${name}.json`);
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            logger.error('Error reading workflow file:', JSON.stringify(err));
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
      //     { owningUser: req.user.username, },
      //   ]
      // }
      return this.db.collection('workflows').find({ owningUser: this.user.username, name })
      .toArray().then(rows => {
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
