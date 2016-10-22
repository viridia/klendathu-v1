const { MongoClient } = require('mongodb');
const RootResolver = require('../resolvers/root');
const logger = require('../common/logger');
const winston = require('winston');

// Silence logging
logger.remove(winston.transports.Console);

const DB_URL = 'mongodb://localhost:27017/klendathu-test';
const mongo = MongoClient.connect(DB_URL).catch(err => {
  logger.error(`Error connecting to database: ${err}`);
  process.exit(1);
});

module.exports = {
  reset() {
    return mongo.then(db => {
      return Promise.all([
        db.collection('users').deleteMany({}),
        db.collection('labels').deleteMany({}),
        db.collection('projects').deleteMany({}),
      ]);
    });
  },

  /** Construct a new root context that is connected to the test db. */
  createRoot(user) {
    return mongo.then(db => {
      return new RootResolver(db, user);
    });
  },

  /** Add a user object to the database (or update if already created.) */
  createUser({ username, fullname, photo }) {
    return mongo.then(db => {
      return db.collection('users').updateOne(
          { username },
          { username, fullname, photo },
          { upsert: true })
      .then(() => {
        return db.collection('users').findOne({ username });
      });
    });
  },
};
