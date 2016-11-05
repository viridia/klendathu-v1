/** The root resolver. */
class RootResolver {
  constructor(db, user) {
    this.db = db;
    this.user = user;
  }

  profile() {
    return this.user;
  }
}

require('../resolvers/attachments')(RootResolver);
require('../resolvers/issue')(RootResolver);
require('../resolvers/label')(RootResolver);
require('../resolvers/project')(RootResolver);
require('../resolvers/projectMembership')(RootResolver);
require('../resolvers/template')(RootResolver);
require('../resolvers/user')(RootResolver);
require('../resolvers/workflow')(RootResolver);

module.exports = RootResolver;
